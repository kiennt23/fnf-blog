import path from "path";
import { fileURLToPath } from "url";
import express from "express";

import { auth } from "express-openid-connect";

import reactServerMiddleware from "./server";

import dotenv from "dotenv";
import { ViteDevServer } from "vite";

dotenv.config();

const base = process.env.BASE || "/";

const app = express();

const isProd = process.env.NODE_ENV === "production";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.resolve(__dirname, "../static")));

const config = {
  authRequired: false, // If true, all routes require authentication by default
  auth0Logout: false, // Let users log out via Auth0
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
};

let vite: ViteDevServer;

if (!isProd) {
  // In development, create a Vite dev server in middleware mode
  const { createServer: createViteServer } = await import("vite");
  vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "custom",
    base,
  });

  app.use(vite.middlewares);
} else {
  // In production, serve the built static files from /public
  const compression = (await import("compression")).default;
  const sirv = (await import("sirv")).default;
  app.use(compression());
  app.use(base, sirv("./public", { extensions: [] }));
}

app.use(auth(config));

app.get("*", async (req, res) => {
  try {
    let ssrMiddleware = reactServerMiddleware;
    if (!isProd) {
      ssrMiddleware = (await import("./server")).default;
    }
    ssrMiddleware(req, res);
  } catch (e: unknown) {
    const err = e as Error;
    vite?.ssrFixStacktrace(err);
    console.log(err.stack);
    res.status(500).end(err.stack);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
