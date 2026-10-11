import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';

const allowedRoles = new Set([
  'developer',
  'director',
  'procurement',
  'plant_manager',
  'production_staff',
  'store_outlet'
]);

const [email, role] = process.argv.slice(2);
if (!email || !role || !allowedRoles.has(role)) {
  console.error('Usage: node scripts/set-firebase-user-role.mjs <user-email> <role>');
  console.error(`Roles: ${[...allowedRoles].join(', ')}`);
  process.exit(1);
}

const firebaseConfig = JSON.parse(await readFile('.firebaserc', 'utf8'));
const projectId = process.env.GCLOUD_PROJECT || firebaseConfig.projects?.default;
if (!projectId) {
  console.error('Set GCLOUD_PROJECT or configure the default project in .firebaserc.');
  process.exit(1);
}

const authEmulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
let operation = 'initialize Firebase Admin';
try {
  if (!authEmulatorHost) {
    process.env.GOOGLE_CLOUD_QUOTA_PROJECT ||= projectId;
  }

  const credential = authEmulatorHost
    ? undefined
    : (() => {
        let accessToken;
        try {
          const [command, args] = process.platform === 'win32'
            ? [process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'gcloud.cmd auth application-default print-access-token']]
            : ['gcloud', ['auth', 'application-default', 'print-access-token']];
          accessToken = execFileSync(
            command,
            args,
            { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30000 }
          ).trim();
        } catch (error) {
          const diagnostic = error.stderr?.toString().trim();
          throw new Error(
            `Could not get an ADC access token from gcloud. Run \`gcloud auth application-default login\` and retry.${diagnostic ? `\n${diagnostic}` : ''}`
          );
        }

        if (!accessToken) {
          throw new Error('gcloud returned an empty ADC access token.');
        }

        return {
          async getAccessToken() {
            return { access_token: accessToken, expires_in: 3600 };
          }
        };
      })();

  initializeApp(authEmulatorHost
    ? { projectId }
    : { credential, projectId });
  const adminAuth = getAuth();
  operation = `look up ${email} in Firebase Authentication`;
  const user = await adminAuth.getUserByEmail(email);
  operation = `assign the "${role}" role claim to ${email}`;
  await adminAuth.setCustomUserClaims(user.uid, {
    ...user.customClaims,
    role
  });
  console.log(`Assigned role "${role}" to ${email} (${user.uid}) in ${projectId}.`);
  console.log('The user must sign in again to receive the updated ID token claim.');
} catch (error) {
  const code = error?.code || 'unknown';
  console.error(`Could not ${operation} in ${projectId} (${code}).`);
  console.error(error?.message || error);
  if (error?.httpResponse?.data) {
    console.error('Firebase API response:', JSON.stringify(error.httpResponse.data));
  }

  const causeCode = error?.cause?.code || error?.cause?.cause?.code;
  if (code === 'auth/internal-error') {
    console.error([
      'Firebase Authentication returned an internal error. The role claim was not confirmed as assigned.',
      'Confirm that the ADC quota project is set and that the Google account has Firebase Authentication Admin access. The script uses the configured project as the quota project for Firebase API calls.',
      'Confirm the target email already exists under Firebase Console > Authentication > Users.',
      'If those checks pass, wait a few minutes and retry; if it persists, check Google Cloud Service Health and Firebase Authentication API status for this project.'
    ].join('\n'));
  } else if (causeCode === 'ETIMEDOUT' || causeCode === 'ECONNRESET' || causeCode === 'ENOTFOUND') {
    console.error([
      `Node.js could not reach a Google API endpoint (${causeCode}). The OAuth access token is obtained through gcloud, but the Admin SDK still needs HTTPS access to Firebase Authentication.`,
      'Check connectivity without displaying credentials:',
      '  Test-NetConnection identitytoolkit.googleapis.com -Port 443',
      '  gcloud auth application-default print-access-token | Out-Null',
      'If gcloud and curl work but the Firebase request times out in Node.js, allow node.exe outbound HTTPS to identitytoolkit.googleapis.com or configure it to use your approved corporate proxy. Do not paste proxy values if they contain credentials.'
    ].join('\n'));
  } else if (code === 'app/invalid-credential') {
    console.error([
      'Repair the local Google Application Default Credentials, then retry:',
      '  gcloud auth application-default revoke',
      '  gcloud auth application-default login --disable-quota-project',
      'The Google account must have Firebase Authentication Admin access on this project.',
      'If gcloud does not recognize --disable-quota-project, update the Google Cloud CLI or have the project administrator grant Service Usage Consumer.'
    ].join('\n'));
  } else if (code === 'auth/user-not-found') {
    console.error('Create the user first in Firebase Console > Authentication > Users.');
  }

  process.exitCode = 1;
}
