const base = "http://localhost:3000";

function parseSetCookie(res) {
  const raw = res.headers.getSetCookie?.() || [];
  return raw.map((c) => c.split(";")[0]).join("; ");
}

async function login(email, password) {
  const csrfRes = await fetch(`${base}/api/auth/csrf`);
  const csrfCookies = parseSetCookie(csrfRes);
  const { csrfToken } = await csrfRes.json();

  const body = new URLSearchParams({
    csrfToken,
    email,
    password,
    callbackUrl: `${base}/`,
    json: "true",
  });

  const loginRes = await fetch(`${base}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: csrfCookies,
    },
    body,
    redirect: "manual",
  });

  const loginCookies = parseSetCookie(loginRes);
  const cookies = [csrfCookies, loginCookies].filter(Boolean).join("; ");
  return { status: loginRes.status, cookies, body: await loginRes.text() };
}

const student = await login("eleve@merk.demo", "merk1234");
console.log("student login", student.status, student.body.slice(0, 120));

const dash = await fetch(`${base}/api/dashboard`, {
  headers: { Cookie: student.cookies },
});
console.log("dashboard", dash.status);
const dashJson = await dash.json();
console.log("dueCount", dashJson.dueCount, "prep", dashJson.prepScore);

const due = await fetch(`${base}/api/review/due`, {
  headers: { Cookie: student.cookies },
});
const dueJson = await due.json();
console.log("due api", due.status, "cards", dueJson.count);

const admin = await login("admin@merk.demo", "merk1234");
const overview = await fetch(`${base}/api/admin/overview`, {
  headers: { Cookie: admin.cookies },
});
console.log("admin", overview.status);
const overviewJson = await overview.json();
console.log("students", overviewJson.students?.length, "alerts", overviewJson.alerts?.length);
