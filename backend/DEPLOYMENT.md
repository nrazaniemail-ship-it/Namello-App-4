# Namello Backend Deployment

## Authentication modes

The backend supports three modes:

- `firebase`: verifies Firebase ID tokens through Firebase Admin SDK and issues Namello backend sessions. Use this mode with the Firebase sign-in gate in the 1.0.5 integration branch.
- `google`: verifies Google OAuth ID tokens directly.
- `local`: development/demo only; forbidden when `NODE_ENV=production`.

## Render: Firebase mode

Set these environment variables on the Render service:

- `NODE_ENV=production`
- `NAMELLO_AUTH_MODE=firebase`
- `FIREBASE_PROJECT_ID=namello-app-4`
- `FIREBASE_SERVICE_ACCOUNT_JSON=<service account JSON stored as a secret environment variable>`
- `NAMELLO_SESSION_SECRET=<at least 32 random characters>`
- `CORS_ORIGINS=https://nrazaniemail-ship-it.github.io`
- `DB_PATH=/var/data/namello.sqlite` only if a persistent disk is mounted at `/var/data`.

Keep the service-account JSON private. Do not paste it into chat, commit it to GitHub, or place it in browser code. The backend checks that the service-account project ID matches `FIREBASE_PROJECT_ID`. If `FIREBASE_SERVICE_ACCOUNT_JSON` is absent, the server attempts Application Default Credentials instead.

The browser Firebase configuration contains the Firebase Web API key, project ID, app ID, auth domain, and messaging sender ID. The Web API key is not a server secret, but it must be the current key associated with the correct Firebase Web app/project. Obtain the configuration again from Firebase Console → Project settings → General → Your apps → SDK setup and configuration. Enable Email/Password and Google providers in Authentication, and add the deployed app's domain to Authorized domains.

## Render: Google OAuth mode

For direct Google OAuth backend verification instead of Firebase, set:

- `NODE_ENV=production`
- `NAMELLO_AUTH_MODE=google`
- `GOOGLE_CLIENT_ID=<Google OAuth Web Client ID used by Namello settings>`
- `NAMELLO_SESSION_SECRET=<at least 32 random characters>`
- `CORS_ORIGINS=https://nrazaniemail-ship-it.github.io`

## Local development

Use Node.js 22.5 or later. For local development only:

- `NODE_ENV=development`
- `NAMELLO_AUTH_MODE=local`
- `NAMELLO_SESSION_SECRET=<at least 32 random characters>`

The backend uses Node's built-in SQLite support. Attach persistent storage if sync records must survive redeploys.

## Health check and verification

`GET /healthz` reports backend health and the active authentication mode. A successful health check does not prove sign-in works. Verify the full flow from the deployed PWA: create/sign in to a test account, confirm the Firebase ID token is accepted by `/v1/auth/firebase/verify`, and then test sync. Email/password accounts must verify their email before a backend session is issued.

## Integration branch test plan

The `integration/firebase-auth-main-1.0.5` branch is an isolated validation branch. It is not the production `main` branch and does not automatically change the Render service, which currently tracks the separate Firebase feature branch.

Before merging or changing the Render branch, verify:

1. GitHub Actions completes the debug APK build for this integration branch.
2. The PWA opens the Firebase sign-in gate and the Firebase Web SDK initializes without `auth/api-key-not-valid`.
3. Email/password signup, email verification, login, Google login, and logout work with a test account.
4. The Render backend accepts the resulting Firebase ID token at `/v1/auth/firebase/verify`.
5. Backend session requests and encrypted sync upload/download work.
6. A clean install of the generated APK is tested on an Android device.

Do not merge this branch or repoint Render based only on a successful APK build; the real Firebase sign-in and sync tests are required.
