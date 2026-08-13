exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const password = process.env.CASE_STUDY_PASSWORD;

  // No password configured → allow access (useful for local / preview testing)
  if (!password) {
    return {
      statusCode: 200,
      headers: {
        "Set-Cookie": "hc_auth=1; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ok: true, note: "No password set" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: "Bad request" };
  }

  if (body.password !== password) {
    return { statusCode: 401, body: "Unauthorized" };
  }

  return {
    statusCode: 200,
    headers: {
      "Set-Cookie": "hc_auth=1; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ok: true }),
  };
};
