# Firebase Authentication Setup

DairySync signs users in with Firebase Authentication (Email/Password). The app requires a trusted Firebase custom claim named `role`; it does not accept a role from the login form or local storage.

## Firebase Console

1. Open project `dairysync-pcc-94978` in Firebase Console.
2. Go to **Authentication > Sign-in method** and enable **Email/Password**. Do not enable public account creation in the application.
3. Under **Authentication > Settings > Authorized domains**, confirm `dairysync-pcc-94978.web.app` and any production custom domain are present.
4. Create each staff account in **Authentication > Users** with the staff member's institutional email. Use a secure temporary password and require the user to reset it. Do not use the former demo passwords.

## Assign Role Claims

Role claims are written by the Firebase Admin SDK script. Run it only from a trusted administrator workstation with Google Application Default Credentials for this Firebase project:

```powershell
gcloud auth application-default login
$env:GCLOUD_PROJECT = "dairysync-pcc-94978"
node scripts/set-firebase-user-role.mjs "staff@pcc-mmsu.gov.ph" "director"
```

Supported roles: `developer`, `director`, `procurement`, `plant_manager`, `production_staff`, `store_outlet`.

The target Firebase Auth user must already exist. The user needs to sign out and back in after a role claim is changed. Never put a service-account key or Admin SDK credentials in `.env.local`, Vite variables, browser storage, or the repository.

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

## Current Boundary

Firebase Authentication now verifies identity and the role claim in the browser. Operational inventory still uses localStorage/IndexedDB and the current Hosting deployment has no authenticated data API. Therefore Firebase sign-in alone does not secure data against a modified browser client. Before treating this as production authorization, move writes and shared data to a trusted backend (for example, Cloud Run with Firebase Admin ID-token verification and Cloud SQL) or use Firebase products with restrictive Security Rules. Enforce the same role policy on that backend; client-side visibility checks are only presentation.
