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
  return [csrfCookies, parseSetCookie(loginRes)].filter(Boolean).join("; ");
}

const cookies = await login("eleve@merk.demo", "merk1234");
const dueRes = await fetch(`${base}/api/review/due`, { headers: { Cookie: cookies } });
const due = await dueRes.json();
const card = due.cards[0];
console.log("card", card.prompt);

const checkRes = await fetch(`${base}/api/review/check`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Cookie: cookies },
  body: JSON.stringify({ progressId: card.progressId, answer: "wrong" }),
});
console.log("check wrong", await checkRes.json());

const submitRes = await fetch(`${base}/api/review/submit`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Cookie: cookies },
  body: JSON.stringify({
    progressId: card.progressId,
    answer: "wrong",
    quality: "HARD",
  }),
});
const submit = await submitRes.json();
console.log("submit", submitRes.status, {
  correct: submit.correct,
  points: submit.points,
  expected: submit.expected,
  prepScore: submit.prepScore,
});
