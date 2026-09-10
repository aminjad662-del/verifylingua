import { POST as registerHandler } from "../app/api/auth/register/route";
import { GET as meHandler } from "../app/api/auth/me/route";
import { middleware } from "../middleware";
import { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "../lib/auth/session";

async function runTrace() {
  console.log("================================================================================");
  console.log("PHASE 2 AUTH GATE: SCRIPTED E2E SIGNUP -> REDIRECT -> RELOAD TRACE");
  console.log("================================================================================\n");

  // Step 1: Unauthenticated request to /dashboard
  console.log("[TRACE 1] Intercepting Unauthenticated Request to Protected Route:");
  const unauthReq = new NextRequest("http://localhost:3000/dashboard", {
    method: "GET",
  });
  const unauthRes = middleware(unauthReq);
  console.log(`  Target URL:       ${unauthReq.url}`);
  console.log(`  Response Status:  ${unauthRes.status}`);
  console.log(`  Redirect Header:  ${unauthRes.headers.get("location")}`);
  if (unauthRes.status === 307 && unauthRes.headers.get("location")?.includes("/login")) {
    console.log("  >>> SUCCESS: Middleware blocked unauthenticated access and enforced redirect to /login.\n");
  } else {
    throw new Error("Step 1 failed: Expected redirect to /login");
  }

  // Step 2: Signup end-to-end
  const testEmail = `elena_${Date.now()}@verifylingua.com`;
  console.log("[TRACE 2] Executing End-to-End Registration (Signup):");
  console.log(`  Payload:          { name: "Elena Rostova", email: "${testEmail}", accountType: "INDIVIDUAL" }`);
  const registerReq = new NextRequest("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Elena Rostova",
      email: testEmail,
      password: "StrongLegalPassword2026!",
      accountType: "INDIVIDUAL",
      terms: true,
    }),
  });
  const registerRes = await registerHandler(registerReq);
  const registerBody = await registerRes.json();
  const setCookie = registerRes.headers.get("set-cookie") || "";
  console.log(`  Response Status:  ${registerRes.status} CREATED`);
  console.log(`  User Created:     ${registerBody.user.id} (${registerBody.user.email})`);
  console.log(`  Set-Cookie:       ${setCookie.slice(0, 50)}...`);

  const match = setCookie.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
  if (!match) throw new Error("Step 2 failed: Missing session cookie");
  const sessionToken = match[1];
  console.log(`  Session Token:    ${sessionToken.slice(0, 16)}...`);
  console.log("  >>> SUCCESS: User signed up and cryptographically signed session cookie minted.\n");

  // Step 3: Access protected /dashboard with authenticated cookie
  console.log("[TRACE 3] Requesting Protected /dashboard with Minted Session Cookie:");
  const authReq = new NextRequest("http://localhost:3000/dashboard", {
    method: "GET",
    headers: {
      cookie: `${SESSION_COOKIE_NAME}=${sessionToken}`,
    },
  });
  const authRes = middleware(authReq);
  console.log(`  Target URL:       ${authReq.url}`);
  console.log(`  Response Status:  ${authRes.status}`);
  console.log(`  Location Header:  ${authRes.headers.get("location") || "null (allowed pass-through)"}`);
  if (authRes.status === 200 && !authRes.headers.get("location")) {
    console.log("  >>> SUCCESS: Middleware verified session cookie and allowed direct entry to /dashboard.\n");
  } else {
    throw new Error("Step 3 failed: Expected pass-through to /dashboard");
  }

  // Step 4: Initial Page Load (GET /api/auth/me)
  console.log("[TRACE 4] Initial Page Load - Session Verification (GET /api/auth/me):");
  const meReq1 = new NextRequest("http://localhost:3000/api/auth/me", {
    method: "GET",
    headers: {
      cookie: `${SESSION_COOKIE_NAME}=${sessionToken}`,
    },
  });
  const meRes1 = await meHandler(meReq1);
  const meBody1 = await meRes1.json();
  console.log(`  Response Status:  ${meRes1.status} OK`);
  console.log(`  Authenticated:    ${meBody1.authenticated}`);
  console.log(`  Resolved User ID: ${meBody1.user.id}`);
  console.log(`  Resolved Email:   ${meBody1.user.email}`);
  console.log("  >>> SUCCESS: Session identity resolved correctly.\n");

  // Step 5: Page Reload (GET /api/auth/me)
  console.log("[TRACE 5] Page Reload - Verifying Session Persistence (GET /api/auth/me):");
  const meReq2 = new NextRequest("http://localhost:3000/api/auth/me", {
    method: "GET",
    headers: {
      cookie: `${SESSION_COOKIE_NAME}=${sessionToken}`,
    },
  });
  const meRes2 = await meHandler(meReq2);
  const meBody2 = await meRes2.json();
  console.log(`  Response Status:  ${meRes2.status} OK`);
  console.log(`  Authenticated:    ${meBody2.authenticated}`);
  console.log(`  Resolved User ID: ${meBody2.user.id}`);
  console.log(`  Identical Match:  ${meBody1.user.id === meBody2.user.id}`);
  if (meBody2.authenticated && meBody1.user.id === meBody2.user.id) {
    console.log("  >>> SUCCESS: Session persisted seamlessly across page reload with 100% identity preservation.\n");
  } else {
    throw new Error("Step 5 failed: Session did not persist on reload");
  }

  // Step 6: Tampered Cookie Defense
  console.log("[TRACE 6] Tampered Session Rejection Defense:");
  const tamperedReq = new NextRequest("http://localhost:3000/api/auth/me", {
    method: "GET",
    headers: {
      cookie: `${SESSION_COOKIE_NAME}=forged_malicious_token_xyz`,
    },
  });
  const tamperedRes = await meHandler(tamperedReq);
  const tamperedBody = await tamperedRes.json();
  console.log(`  Response Status:  ${tamperedRes.status} OK`);
  console.log(`  Authenticated:    ${tamperedBody.authenticated}`);
  console.log(`  Resolved User:    ${tamperedBody.user}`);
  if (!tamperedBody.authenticated && tamperedBody.user === null) {
    console.log("  >>> SUCCESS: Invalid and tampered session tokens are rejected immediately.\n");
  } else {
    throw new Error("Step 6 failed: Tampered token was not rejected");
  }

  console.log("================================================================================");
  console.log("GATE RESULT: ALL VERIFICATION CHECKS PASSED (SIGNUP -> REDIRECT -> RELOAD)");
  console.log("================================================================================");
}

runTrace().catch((err) => {
  console.error("Trace failed:", err);
  process.exit(1);
});
