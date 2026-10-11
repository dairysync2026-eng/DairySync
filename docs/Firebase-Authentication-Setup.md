# Firebase Authentication Setup

DairySync signs users in with Firebase Authentication (Email/Password). The app requires a trusted Firebase custom claim named `role`; it does not accept a role from the login form or local storage.

## Firebase Console

1. Open project `dairysync-pcc-94978` in Firebase Console.
2. Go to **Authentication > Sign-in method** and enable **Email/Password**. Do not enable public account creation in the application.
3. Under **Authentication > Settings > Authorized domains**, confirm `dairysync-pcc-94978.web.app` and any production custom domain are present.
4. Create a separate account in **Authentication > Users** for each staff member, using their institutional email. Multiple accounts may share a DairySync role. Give each person a unique email and username; never share a login.

## Assign Role Claims

Role claims are written by the Firebase Admin SDK script. It reads an access token from the local Google Cloud CLI ADC credentials, then uses the Firebase Admin SDK to update the role claim. The script sends the configured Firebase project as the quota project for its API requests. Run it only from a trusted administrator workstation:

```powershell
gcloud auth application-default revoke
gcloud auth application-default login --disable-quota-project
$env:GCLOUD_PROJECT = "dairysync-pcc-94978"
node scripts/set-firebase-user-role.mjs "director.one@pcc-mmsu.gov.ph" "director"
node scripts/set-firebase-user-role.mjs "director.two@pcc-mmsu.gov.ph" "director"
node scripts/set-firebase-user-role.mjs "production.one@pcc-mmsu.gov.ph" "production_staff"
node scripts/set-firebase-user-role.mjs "outlet.one@pcc-mmsu.gov.ph" "store_outlet"
```

Supported roles: `developer`, `director`, `procurement`, `plant_manager`, `production_staff`, `store_outlet`.

Each target Firebase Auth user must already exist. Run one command for every account. The user needs to sign out and back in after a role claim is changed. Never put a service-account key, access token, or Admin SDK credentials in `.env.local`, Vite variables, browser storage, or the repository.

`gcloud config set project` only changes the gcloud CLI's selected project; it does not grant project access or repair ADC. The Google account used for ADC must have the Firebase Authentication Admin role on this project. If the Cloud CLI does not support `--disable-quota-project`, update it or ask the project administrator to grant Service Usage Consumer (`roles/serviceusage.serviceUsageConsumer`). Do not try to set a quota project unless the Google account has that permission. If the script reports `app/invalid-credential`, revoke and re-create ADC as above, then retry from the repository folder.

The script obtains the short-lived OAuth access token through `gcloud auth application-default print-access-token` to avoid Node.js having to refresh ADC directly. If a Firebase API request reports `ETIMEDOUT`, `ECONNRESET`, or `ENOTFOUND`, check `Test-NetConnection identitytoolkit.googleapis.com -Port 443` and ask the workstation or network administrator to allow Node.js outbound HTTPS to Firebase Authentication or configure it to use the approved corporate proxy. Never share the access token or proxy URLs containing credentials.

## Add the shared staff profile

After creating the Firebase account and assigning its role claim, sign into DairySync as a developer and open **Command Center > Manage All Account Users > Add Staff Profile**. Enter the account's Firebase email, a unique username, the same role, and the staff member's profile details. This adds the shared directory profile; it does not create a Firebase login or change Firebase credentials. Each person must sign in with their own Firebase email and password.

Authenticated sessions are automatically signed out after 10 minutes without user activity. Pointer, keyboard, scroll, and focus activity resets the timer, and activity is shared between open DairySync tabs.

### PCC-MMSU Staff Role Mapping

After creating these email accounts in Firebase Authentication, assign their claims from the trusted workstation:

```powershell
node scripts/set-firebase-user-role.mjs "developer@pcc-mmsu.gov.ph" "developer"
node scripts/set-firebase-user-role.mjs "dr.domingo@pcc-mmsu.gov.ph" "director"
node scripts/set-firebase-user-role.mjs "procurement@pcc-mmsu.gov.ph" "procurement"
node scripts/set-firebase-user-role.mjs "plant.manager@pcc-mmsu.gov.ph" "plant_manager"
node scripts/set-firebase-user-role.mjs "production@pcc-mmsu.gov.ph" "production_staff"
node scripts/set-firebase-user-role.mjs "dairybox@pcc-mmsu.gov.ph" "store_outlet"
```

## Local Configuration

The browser Firebase configuration is read from `.env.local` at build time. Populate the `VITE_FIREBASE_*` values from Firebase Console **Project settings > Your apps > Web app**. These web config values identify the Firebase project; they are not Admin credentials. Keep `.env.local` out of Git and deploy a new Hosting build after changing it.

## SQL Connect (PostgreSQL)

The repository now defines a SQL Connect service in `dataconnect/`. Its configuration targets service `dairysync`, region `asia-southeast1`, Cloud SQL instance `dairysync-postgres`, and database `dairysync`. Create or select a Cloud SQL PostgreSQL instance with those exact settings before deploying; SQL Connect does not connect the browser directly to PostgreSQL.

The generated web SDK is committed under `src/generated/dairysync` and imported as `@dataconnect/dairysync-generated`. Regenerate it after editing the schema or connector operations:

```powershell
npm run sqlconnect:generate
```

For fully local development, set these values in the ignored `.env.local` file:

```dotenv
VITE_FIREBASE_PROJECT_ID=demo-dairysync
VITE_USE_FIREBASE_AUTH_EMULATOR=true
VITE_USE_SQL_CONNECT_EMULATOR=true
```

Start the Auth and SQL Connect emulators with `npm run sqlconnect:emulator`, create a test user in the Auth Emulator UI at `http://127.0.0.1:4000`, and assign its local role claim:

```powershell
$env:GCLOUD_PROJECT = "demo-dairysync"
$env:FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099"
node scripts/set-firebase-user-role.mjs "developer@example.test" "developer"
```

Run DairySync in a second terminal. Restore the real Firebase project ID and turn off emulator flags before building for Hosting. Deploy the SQL Connect service before deploying a frontend that calls its operations:

```powershell
npm run sqlconnect:emulator
npm run sqlconnect:deploy
```

SQL operations enforce the Firebase `role` custom claim on the server. The browser uses the same Firebase app and current Auth session; never add PostgreSQL credentials or service-account keys to frontend configuration.

### Current integration boundary

User profiles, raw ingredients, finished goods, WIP batches, commitments, alerts, stock transactions, ISO ratings, and audit entries load from SQL Connect and subscribe to remote changes. Local state remains cached in localStorage/IndexedDB. Role claims in Firebase Authentication, not the profile table or simulated role selector, are the authority for SQL Connect access. Audit reads are limited to developer/director; a user's own profile update is filtered by the signed-in email; retail staff get a stock-only finished-good mutation.

When a SQL Connect table is empty, the first signed-in developer account initializes it from that browser's local copy. Before the first developer login against a newly provisioned database, verify that this browser holds the intended canonical data and make a backup. Other roles do not seed. Failed collection writes are queued with the originating Firebase UID and retried only for that account; an item is removed only after its SQL Connect operation succeeds.

The collection sync performs row-level upserts/deletes, not atomic business workflows. For example, a POS sale can update finished-good stock, its stock transaction, and its audit event as separate mutations. Add transaction-aware operations and concurrency checks before relying on this for simultaneous stock-changing work. The production Hosting deployment will not use this integration until the connector is deployed and a new frontend build is published.
