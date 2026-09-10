const http = require("http");

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
        });
      });
    });
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runAuthGate() {
  console.log("===============================================================");
  console.log("PHASE 2 AUTH GATE: SCRIPTED E2E SIGNUP -> REDIRECT -> RELOAD");
  console.log("===============================================================\n");

  const baseUrl = "localhost";
  const port = 3000;

  // STEP 1: Unauthenticated request to protected route (/dashboard)
  console.log("[STEP 1] Testing unauthenticated access to /dashboard...");
  const step1 = await request({
    hostname: baseUrl,
    port,
    path: "/dashboard",
    method: "GET",
  });
  console.log(`  -> Status: ${step1.statusCode}`);
  console.log(`  -> Location header: ${step1.headers.location}`);
  const isRedirect = step1.statusCode === 307 || step1.statusCode === 302;
  const redirectsToLogin = step1.headers.location && step1.headers.location.includes("/login");
  if (isRedirect && redirectsToLogin) {
    console.log("  [PASS] Middleware successfully intercepted unauthenticated request and redirected to /login\n");
  } else {
    console.error("  [FAIL] Expected redirect to /login");
    process.exit(1);
  }

  // STEP 2: Execute Signup via /api/auth/register
  const email = `e2e_user_${Date.now()}@verifylingua.com`;
  const signupPayload = JSON.stringify({
    name: "Elena Rostova",
    email,
    password: "StrongLegalPassword2026!",
    accountType: "INDIVIDUAL",
    terms: true,
  });

  console.log(`[STEP 2] Executing signup for user: ${email}...`);
  const step2 = await request(
    {
      hostname: baseUrl,
      port,
      path: "/api/auth/register",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(signupPayload),
      },
    },
    signupPayload
  );

  console.log(`  -> Status: ${step2.statusCode}`);
  const setCookieHeader = step2.headers["set-cookie"];
  console.log(`  -> Set-Cookie: ${JSON.stringify(setCookieHeader)}`);
  
  if (step2.statusCode !== 201 || !setCookieHeader) {
    console.error("  [FAIL] Registration failed or Set-Cookie missing");
    process.exit(1);
  }

  // Extract session cookie (vl_session or __session)
  const cookieStr = Array.isArray(setCookieHeader) ? setCookieHeader.join("; ") : setCookieHeader;
  const match = cookieStr.match(/vl_session=([^;]+)/) || cookieStr.match(/__session=([^;]+)/);
  if (!match) {
    console.error("  [FAIL] Could not extract session token from cookie");
    process.exit(1);
  }
  const sessionCookie = match[0];
  console.log(`  -> Extracted session cookie: ${sessionCookie.slice(0, 30)}...`);
  console.log("  [PASS] Signup complete and session cookie issued.\n");

  // STEP 3: Access protected /dashboard with session cookie
  console.log("[STEP 3] Accessing protected /dashboard with session cookie...");
  const step3 = await request({
    hostname: baseUrl,
    port,
    path: "/dashboard",
    method: "GET",
    headers: {
      Cookie: sessionCookie,
    },
  });
  console.log(`  -> Status: ${step3.statusCode}`);
  if (step3.statusCode === 200) {
    console.log("  [PASS] Authenticated request to /dashboard permitted with HTTP 200 OK (no redirect).\n");
  } else {
    console.error(`  [FAIL] Expected HTTP 200, got ${step3.statusCode}`);
    process.exit(1);
  }

  // STEP 4: Session persists on page reload / verification (api/auth/me)
  console.log("[STEP 4] Simulating page reload (Request 1: GET /api/auth/me)...");
  const step4a = await request({
    hostname: baseUrl,
    port,
    path: "/api/auth/me",
    method: "GET",
    headers: {
      Cookie: sessionCookie,
    },
  });
  console.log(`  -> Status: ${step4a.statusCode}`);
  const user1 = JSON.parse(step4a.body);
  console.log(`  -> Authenticated: ${user1.authenticated}, User: ${user1.user?.email} (ID: ${user1.user?.id})`);

  console.log("[STEP 5] Simulating second page reload (Request 2: GET /api/auth/me)...");
  const step4b = await request({
    hostname: baseUrl,
    port,
    path: "/api/auth/me",
    method: "GET",
    headers: {
      Cookie: sessionCookie,
    },
  });
  console.log(`  -> Status: ${step4b.statusCode}`);
  const user2 = JSON.parse(step4b.body);
  console.log(`  -> Authenticated: ${user2.authenticated}, User: ${user2.user?.email}`);

  if (user1.authenticated && user2.authenticated && user1.user.id === user2.user.id) {
    console.log("  [PASS] Session persists across reloads with identical identity integrity.\n");
  } else {
    console.error("  [FAIL] Session failed to persist on reload");
    process.exit(1);
  }

  // STEP 6: Negative verification - tampered cookie rejected
  console.log("[STEP 6] Testing negative case: tampered session cookie...");
  const step5 = await request({
    hostname: baseUrl,
    port,
    path: "/api/auth/me",
    method: "GET",
    headers: {
      Cookie: "vl_session=tampered_malicious_token_xyz",
    },
  });
  const tamperedRes = JSON.parse(step5.body);
  console.log(`  -> Authenticated: ${tamperedRes.authenticated}, User: ${tamperedRes.user}`);
  if (tamperedRes.authenticated === false && tamperedRes.user === null) {
    console.log("  [PASS] Tampered session correctly rejected.\n");
  } else {
    console.error("  [FAIL] Tampered session was not rejected");
    process.exit(1);
  }

  console.log("===============================================================");
  console.log("ALL AUTH GATE TESTS PASSED (SIGNUP -> REDIRECT -> RELOAD)");
  console.log("===============================================================");
}

runAuthGate().catch((err) => {
  console.error("Auth Gate Error:", err);
  process.exit(1);
});
