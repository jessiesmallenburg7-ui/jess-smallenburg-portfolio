export default async (request, context) => {
  const url = new URL(request.url);

  // Let the access page through
  if (url.pathname.includes("/access")) {
    return;
  }

  // Check for the auth cookie
  const cookies = request.headers.get("cookie") || "";
  if (cookies.includes("hc_auth=1")) {
    return; // already authenticated
  }

  // Not authenticated → redirect to the access page
  return Response.redirect(new URL("./access/", url).toString(), 302);
};

export const config = {
  path: "/projects/healthcare-consulting/*",
};
