import { PluginRequest, clerkBaseUrl } from "..";

export const withClerkUser = async (request: PluginRequest) => {
  const auth = request.headers.get("Authorization");

  if (!auth) {
    return Response.json(
      { message: "Authorization header missing" },
      { status: 401 }
    );
  }

  const bearer = auth.split(" ")[1];
  const res = await fetch(`${clerkBaseUrl}/oauth/userinfo`, {
    headers: {
      Authorization: `Bearer ${bearer}`,
    },
  });

  if (!res.ok) {
    return Response.json({ message: "Authentication failed" }, { status: 401 });
  }

  const user = (await res.json()) as PluginRequest["user"];

  if (!user.user_id) {
    return Response.json(
      { message: "Failed getting Clerk user" },
      { status: 401 }
    );
  }

  // set the user on the request object
  request.user = user;
};
