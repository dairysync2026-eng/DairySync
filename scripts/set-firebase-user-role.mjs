import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
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

initializeApp({ credential: applicationDefault(), projectId });
const adminAuth = getAuth();
const user = await adminAuth.getUserByEmail(email);
await adminAuth.setCustomUserClaims(user.uid, {
  ...user.customClaims,
  role
});
console.log(`Assigned role "${role}" to ${email} (${user.uid}) in ${projectId}.`);
console.log('The user must sign in again to receive the updated ID token claim.');
