import type { Config, Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  const password = Netlify.env.get("CASE_STUDY_PASSWORD");
  const url = new URL(request.url);

  // Only protect the main case study page, not the /access/ page itself
  if (url.pathname.includes("/access")) {
    return; // let the access page through
  }

  // Check for the auth cookie
  const cookies = request.headers.get("cookie") || "";
  if (cookies.includes("hc_auth=1")) {
    return; // already authenticated
  }

  // Not authenticated → redirect to the access page
  return Response.redirect(new URL("./access/", url).toString(), 302);
};

export const config: Config = {
  path: "/projects/healthcare-consulting/*",
};
