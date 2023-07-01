import { OpenAPIRouter } from "@cloudflare/itty-router-openapi";
import { withClerkUser } from "./middleware/clerk";
import { SendEmailToSignedInUser, User } from "./handlers/user";

// Adjust these values to your needs
export const clerkBaseUrl = `https://fond-tuna-4.clerk.accounts.dev`;
const pluginVerificationToken = "5e4c84e3ee134914a68faeb53aa822d3";

export type Env = {
  SENDGRID_API_KEY: string;
};

export type PluginRequest = {
  user: {
    user_id: string;
    email?: string;
    email_verified?: true;
    name?: string;
    username?: string;
    picture?: string;
  };
} & Request;

// Changes to the AI Plugin schema requires plugin re-approval from OpenAI
const plugin = OpenAPIRouter({
  schema: {
    info: {
      title: "Plugin with Clerk API",
      description: "A plugin template with Clerk OAuth2 backend",
      version: "v0.0.1",
    },
  },
  docs_url: "/",
  aiPlugin: {
    name_for_human: "Plugin with Clerk",
    name_for_model: "plugin_demonstrating_the_clerk_oauth_integration",
    description_for_human:
      "Authenticate users with Clerk and use user details in your plugin.",
    description_for_model:
      "Authenticate users with Clerk and use user details in your plugin.",
    auth: {
      type: "oauth",
      client_url: `${clerkBaseUrl}/oauth/authorize`,
      authorization_url: `${clerkBaseUrl}/oauth/token`,
      scope: "profile email",
      authorization_content_type: "application/x-www-form-urlencoded",
      verification_tokens: {
        openai: pluginVerificationToken,
      },
    },
    api: {
      has_user_authentication: true,
      type: "openapi",
      url: `/openapi.json`,
    },
    logo_url: `https://clerk.com/images/footer-logo.svg`,
    contact_email: "support@example.com",
    legal_info_url: `https://example.com/legal`,
  },
});

plugin.all("*", withClerkUser);

// Plugin API routes
plugin.get("/user", User);
plugin.post("/user/send-email", SendEmailToSignedInUser);

// fallback to 404
plugin.all("*", (request: PluginRequest) =>
  Response.json({ message: "route not found" }, { status: 404 })
);

export default {
  fetch: plugin.handle,
};
