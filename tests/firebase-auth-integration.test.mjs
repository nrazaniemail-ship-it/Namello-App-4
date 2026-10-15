import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const backend = await readFile(new URL("../backend/server.mjs", import.meta.url), "utf8");
const rootPackage = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

test("Firebase web app is configured for the same project as the backend", () => {
  assert.match(html, /projectId:\s*'namello-app-4'/);
  assert.match(html, /appId:\s*'1:376512435282:web:93302f6faa9388fd243b8b'/);
  assert.match(backend, /FIREBASE_PROJECT_ID/);
  assert.match(backend, /serviceAccount\.project_id !== FIREBASE_PROJECT_ID/);
});

test("Firebase sign-in gate exchanges ID tokens with the Firebase backend endpoint", () => {
  assert.match(html, /firebase-auth-compat\.js/);
  assert.match(html, /\/v1\/auth\/firebase\/verify/);
  assert.match(html, /user\.getIdToken\(true\)/);
  assert.match(backend, /firebaseAuth\.verifyIdToken\(idToken, true\)/);
});

test("Firebase backend dependency is installed from the repository root on Render and CI", () => {
  assert.ok(rootPackage.dependencies?.["firebase-admin"], "firebase-admin must be in root package.json");
});

test("Firebase gate exposes the session to the existing Namello backend sync UI", () => {
  assert.match(html, /window\.NamelloAuth=\{getToken:.*signOut:logout\}/);
  assert.match(html, /function nmBackendGoogleLogin\(onUpdate\)/);
  assert.match(html, /existing\?\.token && window\.NamelloAuth/);
  assert.match(html, /NM_BACKEND_SESSION_KEY = "namello_backend_session_v1"/);
});
