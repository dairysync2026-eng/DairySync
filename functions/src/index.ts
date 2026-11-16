import { randomBytes } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getAuth, type UserRecord } from 'firebase-admin/auth';
import { logger } from 'firebase-functions';
import { HttpsError, onCall, type CallableRequest } from 'firebase-functions/v2/https';

initializeApp();

const USER_ROLES = [
  'developer',
  'system_admin',
  'director',
  'procurement',
  'plant_manager',
  'production_staff',
  'store_outlet',
] as const;
const PRIVILEGED_ROLES = new Set(['developer', 'system_admin']);
const auth = getAuth();

type UserRole = typeof USER_ROLES[number];
type AdminRole = 'developer' | 'system_admin';

function requireAdministrator(request: CallableRequest<unknown>): AdminRole {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign in to manage DairySync accounts.');
  }

  const role = request.auth.token.role;
  if (role !== 'developer' && role !== 'system_admin') {
    throw new HttpsError('permission-denied', 'Only an authorized DairySync administrator can manage accounts.');
  }
  return role;
}

function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && USER_ROLES.includes(value as UserRole);
}

function getRole(user: UserRecord): string | null {
  const role = user.customClaims?.role;
  return typeof role === 'string' ? role : null;
}

async function findAnotherActiveAdministrator(excludedUid: string): Promise<boolean> {
  let pageToken: string | undefined;
  do {
    const page = await auth.listUsers(1000, pageToken);
    if (page.users.some(user =>
      user.uid !== excludedUid &&
      !user.disabled &&
      PRIVILEGED_ROLES.has(getRole(user) || '')
    )) {
      return true;
    }
    pageToken = page.pageToken;
  } while (pageToken);

  return false;
}

function assertRoleAssignable(actorRole: AdminRole, targetRole: UserRole): void {
  if (actorRole === 'system_admin' && PRIVILEGED_ROLES.has(targetRole)) {
    throw new HttpsError('permission-denied', 'System administrators cannot assign developer or system-administrator access.');
  }
}

export const listManagedAccounts = onCall(async request => {
  requireAdministrator(request);

  const accounts: Array<{
    uid: string;
    email: string;
    displayName: string;
    role: string | null;
    disabled: boolean;
    lastSignInTime: string | null;
  }> = [];
  let pageToken: string | undefined;
  do {
    const page = await auth.listUsers(1000, pageToken);
    for (const user of page.users) {
      if (!user.email) continue;
      accounts.push({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        role: getRole(user),
        disabled: user.disabled,
        lastSignInTime: user.metadata.lastSignInTime || null,
      });
    }
    pageToken = page.pageToken;
  } while (pageToken);

  return { accounts };
});

export const createManagedAccount = onCall(async request => {
  const actorRole = requireAdministrator(request);
  const data = request.data as { name?: unknown; email?: unknown; role?: unknown };
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
  if (!name || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpsError('invalid-argument', 'Enter a name and a valid email address.');
  }
  if (!isUserRole(data.role)) {
    throw new HttpsError('invalid-argument', 'Select a supported DairySync role.');
  }
  assertRoleAssignable(actorRole, data.role);

  let user: UserRecord;
  try {
    user = await auth.createUser({
      email,
      displayName: name,
      password: randomBytes(48).toString('base64url'),
      emailVerified: false,
    });
  } catch (error) {
    logger.error('Firebase account creation failed.', {
      email,
      code: (error as { code?: string }).code,
      error,
    });
    if ((error as { code?: string }).code === 'auth/email-already-exists') {
      throw new HttpsError('already-exists', 'A Firebase account already uses this email address.');
    }
    throw new HttpsError('internal', 'Firebase could not create the account.');
  }

  try {
    await auth.setCustomUserClaims(user.uid, { ...user.customClaims, role: data.role });
  } catch (error) {
    try {
      await auth.deleteUser(user.uid);
    } catch (cleanupError) {
      logger.error('Failed to remove a partially provisioned account.', {
        uid: user.uid,
        error: cleanupError,
      });
    }
    logger.error('Failed to assign the role to a newly created account.', {
      uid: user.uid,
      error,
    });
    throw new HttpsError('internal', 'The Firebase account was created but could not be assigned its role. Contact an administrator before retrying.');
  }

  logger.info('DairySync account created.', {
    actorUid: request.auth?.uid,
    actorRole,
    targetUid: user.uid,
    targetEmail: email,
    targetRole: data.role,
  });
  return { uid: user.uid };
});

export const setManagedAccountRole = onCall(async request => {
  const actorRole = requireAdministrator(request);
  const data = request.data as { uid?: unknown; role?: unknown };
  if (typeof data.uid !== 'string' || !data.uid || !isUserRole(data.role)) {
    throw new HttpsError('invalid-argument', 'Select a valid account and DairySync role.');
  }
  if (request.auth?.uid === data.uid) {
    throw new HttpsError('failed-precondition', 'You cannot change your own account role.');
  }
  assertRoleAssignable(actorRole, data.role);

  let target: UserRecord;
  try {
    target = await auth.getUser(data.uid);
  } catch {
    throw new HttpsError('not-found', 'The Firebase account could not be found.');
  }

  const previousRole = getRole(target);
  if (actorRole === 'system_admin' && previousRole && PRIVILEGED_ROLES.has(previousRole)) {
    throw new HttpsError('permission-denied', 'System administrators cannot modify privileged administrator accounts.');
  }
  if (
    previousRole &&
    PRIVILEGED_ROLES.has(previousRole) &&
    !PRIVILEGED_ROLES.has(data.role) &&
    !(await findAnotherActiveAdministrator(target.uid))
  ) {
    throw new HttpsError('failed-precondition', 'At least one active administrator must remain.');
  }

  try {
    await auth.setCustomUserClaims(target.uid, { ...target.customClaims, role: data.role });
    await auth.revokeRefreshTokens(target.uid);
  } catch (error) {
    try {
      await auth.setCustomUserClaims(target.uid, { ...target.customClaims, role: previousRole });
    } catch (rollbackError) {
      logger.error('Failed to restore a role after a role-change operation failed.', {
        targetUid: target.uid,
        previousRole,
        error: rollbackError,
      });
    }
    logger.error('Could not complete the role-change operation.', {
      targetUid: target.uid,
      previousRole,
      requestedRole: data.role,
      error,
    });
    throw new HttpsError('internal', 'The role change could not be completed. Contact an administrator if this account appears to have changed.');
  }
  logger.info('DairySync account role changed.', {
    actorUid: request.auth?.uid,
    actorRole,
    targetUid: target.uid,
    previousRole,
    newRole: data.role,
  });
  return { success: true };
});

export const setManagedAccountDisabled = onCall(async request => {
  const actorRole = requireAdministrator(request);
  const data = request.data as { uid?: unknown; disabled?: unknown };
  if (typeof data.uid !== 'string' || !data.uid || typeof data.disabled !== 'boolean') {
    throw new HttpsError('invalid-argument', 'Select an account and a valid account status.');
  }
  if (request.auth?.uid === data.uid) {
    throw new HttpsError('failed-precondition', 'You cannot disable or reactivate your own account.');
  }

  let target: UserRecord;
  try {
    target = await auth.getUser(data.uid);
  } catch {
    throw new HttpsError('not-found', 'The Firebase account could not be found.');
  }
  const targetRole = getRole(target);
  if (actorRole === 'system_admin' && targetRole && PRIVILEGED_ROLES.has(targetRole)) {
    throw new HttpsError('permission-denied', 'System administrators cannot disable or reactivate privileged administrator accounts.');
  }
  if (
    data.disabled &&
    !target.disabled &&
    targetRole &&
    PRIVILEGED_ROLES.has(targetRole) &&
    !(await findAnotherActiveAdministrator(target.uid))
  ) {
    throw new HttpsError('failed-precondition', 'At least one active administrator must remain.');
  }

  await auth.updateUser(target.uid, { disabled: data.disabled });
  logger.info('DairySync account status changed.', {
    actorUid: request.auth?.uid,
    actorRole,
    targetUid: target.uid,
    disabled: data.disabled,
  });
  if (data.disabled) {
    try {
      await auth.revokeRefreshTokens(target.uid);
    } catch (error) {
      logger.error('Account was disabled but refresh tokens could not be revoked.', {
        targetUid: target.uid,
        error,
      });
      throw new HttpsError('internal', 'The account was disabled, but active sessions could not be fully revoked. Contact an administrator.');
    }
  }
  return { success: true };
});
