import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";
import { Env, PluginRequest } from "..";

export class User extends OpenAPIRoute {
  static schema = {
    tags: ["User"],
    summary: "Get user details",
    responses: {
      "200": {
        schema: {
          user: {
            name: "string",
            email: "string",
          },
        },
      },
    },
  };

  async handle(
    request: PluginRequest,
    env: Env,
    context: ExecutionContext,
    data: Record<string, any>
  ) {
    const user = request.user;

    // return user_id, not returning any other details in this demo
    return {
      user_id: user.user_id,
    };
  }
}

export class SendEmailToSignedInUser extends OpenAPIRoute {
  static schema = {
    tags: ["User"],
    summary: "Send email to the signed in user",
    requestBody: {
      subject: "string",
      bodyHtml: "string",
    },
    responses: {
      "200": {
        schema: {
          status: "number",
        },
      },
    },
  };

  async handle(
    request: PluginRequest,
    env: Env,
    context: ExecutionContext,
    data: Record<string, any>
  ) {
    if (!env.SENDGRID_API_KEY) {
      return {
        status: 500,
        message: "secret SENDGRID_API_KEY is not set, email is not sent",
      };
    }

    const user = request.user;
    const { bodyHtml, subject } = data.body;

    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env.SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [
              {
                email: user.email,
              },
            ],
          },
        ],
        from: {
          email: "assistant@superhelp.ai",
          name: "Assistant - superhelp.ai",
        },
        subject: subject,
        content: [
          {
            type: "text/html",
            value: bodyHtml,
          },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return {
        status: 500,
        message: "error sending email: " + text,
      };
    }

    return {
      status: 200,
    };
  }
}
