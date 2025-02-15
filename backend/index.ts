import path from "path";
import { fileURLToPath } from "url";
import express from "express";

import { auth } from "express-openid-connect";

import dotenv from "dotenv";
import { ViteDevServer } from "vite";
import fs from "fs";

dotenv.config();

const base = process.env.BASE || "/";

const app = express();

const isProd = process.env.NODE_ENV === "production";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  authRequired: false, // If true, all routes require authentication by default
  auth0Logout: false, // Let users log out via Auth0
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
};

const manifestPath = path.resolve(__dirname, "../public/manifest.json");
let manifest: Record<string, Record<string, string>> = {};

if (fs.existsSync(manifestPath)) {
  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}

const getScripts = () => {
  if (!fs.existsSync(manifestPath)) {
    console.warn(`Could not find manifest from ${manifestPath}`);
    // In development, load the client entry (adjust the path if needed)
    return `
        <script type="module" src="/@vite/client"></script>
        <script type="module" src="/frontend/client.tsx"></script>
    `;
  }

  // In production, use the built manifest to load scripts.
  return Object.keys(manifest)
    .filter((name) => name !== "web-worker/service-worker.ts")
    .map(
      (name) => `<script type="module" src="${manifest[name].file}"></script>`,
    )
    .join("\n");
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
app.use(express.static(path.resolve(__dirname, "../static")));

app.get("*", async (req, res) => {
  const url = req.originalUrl;
  try {
    let template = fs.readFileSync(
      path.resolve(__dirname, "../index.html"),
      "utf-8",
    );

    if (!isProd) {
      template = await vite.transformIndexHtml(url, template);
    }

    const { render } = isProd
      ? await import("./entry.tsx")
      : await vite.ssrLoadModule("/backend/entry.tsx");
    const isAuthenticated = req.oidc.isAuthenticated();
    const user = req.oidc.user;
    const appHtml = await render(url, {
      isAuthenticated,
      user,
    });

    if (!isProd) {
      template = template.replace(
        "<!-- third-party-scripts-outlet -->",
        () => `
            <script src="https://unpkg.com/react-scan/dist/auto.global.js"></script>
        `,
      );
    }

    template = template.replace("<!-- app-outlet -->", () => appHtml);
    template = template.replace(
      "<!-- init-data-outlet -->",
      () => `
        <script>window.__INITIAL_DATA__ = ${JSON.stringify({ isAuthenticated, user })}</script>
        <script>window.__MANIFEST_DATA__ = ${JSON.stringify(manifest)}</script>
      `,
    );
    template = template.replace("<!-- scripts-outlet -->", () => getScripts());
    res.status(200).set({ "Content-Type": "text/html" }).end(template);
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
