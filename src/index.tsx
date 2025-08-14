import { Hono } from "hono";
import { renderToPipeableStream } from "react-dom/server";
import type { HttpBindings } from "@hono/node-server";
import { RESPONSE_ALREADY_SENT } from "@hono/node-server/utils/response";
import React from "react";
import App from "./app";

const app = new Hono<{ Bindings: HttpBindings }>();

// Serve static files in production
if (import.meta.env.PROD) {
  const { serveStatic } = await import("@hono/node-server/serve-static");
  app.use("/static/*", serveStatic({ root: "./dist" }));
}

app.get("/api/hello", (c) => c.json({ message: "Hello from Hono API" }));

app.get("/*", async (c) => {
  const outgoing = c.env?.outgoing;

  // Fallback
  if (!outgoing) {
    return c.html(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta content="width=device-width, initial-scale=1" name="viewport" />
  <title>Hono React App</title>
  <script type="module" src="/src/client.tsx"></script>
</head>
<body>
  <div id="root">Loading...</div>
</body>
</html>`);
  }

  // Write HTTP headers
  outgoing.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Transfer-Encoding": "chunked",
  });

  // Write initial HTML
  outgoing.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta content="width=device-width, initial-scale=1" name="viewport" />
  <title>Hono React App</title>
  ${
    import.meta.env.PROD
      ? '<script type="module" src="/static/client.js"></script>'
      : '<script type="module" src="/src/client.tsx"></script>'
  }
</head>
<body>
  <div id="root">`);

  const { pipe } = renderToPipeableStream(React.createElement(App), {
    onShellReady() {
      pipe(outgoing);
    },
    onAllReady() {
      outgoing.end("</div></body></html>");
    },
    onError(error) {
      console.error("Streaming error:", error);
      outgoing.end("</div></body></html>");
    },
  });

  // Return RESPONSE_ALREADY_SENT to tell Hono not to send another response
  return RESPONSE_ALREADY_SENT;
});

// Only start the server if not in Vite dev mode
if (import.meta.env.PROD) {
  const { serve } = await import("@hono/node-server");

  const port = process.env.PORT || 7878;
  serve({ fetch: app.fetch, port: Number(port) }, (info) => {
    console.log("Listening Info: ", info);
  });
}

export default app;
