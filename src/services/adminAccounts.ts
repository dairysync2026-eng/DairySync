import { sendPasswordResetEmail } from 'firebase/auth';
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions';
import type { UserRole } from '../types';
import { app, auth } from './firebase';

export interface ManagedAccount {
  uid: string;
  email: string;
  displayName: string;
  role: string | null;
  disabled: boolean;
  lastSignInTime: string | null;
}

interface ManagedAccountsResponse {
  accounts: ManagedAccount[];
}

const functions = getFunctions(app);

if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_FUNCTIONS_EMULATOR === 'true') {
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
}

export async function fetchManagedAccounts(): Promise<ManagedAccount[]> {
  const call = httpsCallable<void, ManagedAccountsResponse>(functions, 'listManagedAccounts');
  const result = await call();
  return result.data.accounts;
}

export async function createManagedAccount(input: {
  name: string;
  email: string;
  role: UserRole;
}): Promise<{ uid: string }> {
  const call = httpsCallable<typeof input, { uid: string }>(functions, 'createManagedAccount');
  const result = await call(input);
  return result.data;
}

export async function setManagedAccountRole(input: {
  uid: string;
  role: UserRole;
}): Promise<void> {
  const call = httpsCallable<typeof input, void>(functions, 'setManagedAccountRole');
  await call(input);
}

export async function setManagedAccountDisabled(input: {
  uid: string;
  disabled: boolean;
}): Promise<void> {
  const call = httpsCallable<typeof input, void>(functions, 'setManagedAccountDisabled');
  await call(input);
}

export async function requestManagedAccountPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}
