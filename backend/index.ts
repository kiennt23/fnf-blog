import path from "path";
import { fileURLToPath } from "url";
import express from "express";

import { auth } from "express-openid-connect";

import webpack from "webpack";
import webpackDevMiddleware from "webpack-dev-middleware";
import webpackHotMiddleware from "webpack-hot-middleware";

import reactServerMiddleware from "./server";
import { makeSwappableMiddleware } from "./devUtil";

import dotenv from "dotenv";
dotenv.config();

const app = express();

const isProd = process.env.NODE_ENV === "production";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (isProd) {
  // Serve static files from /public (where Webpack bundles client code)
  app.use(express.static(path.resolve(__dirname, "../public")));
} else {
  const webpackConfig = await import(
    path.resolve(__dirname, "../webpack.fe.config.js")
  );
  const compiler = webpack(webpackConfig.default);
  app.use(webpackDevMiddleware(compiler));
  app.use(webpackHotMiddleware(compiler));
}

const PORT = process.env.PORT || 3000;

const config = {
  authRequired: false, // If true, all routes require authentication by default
  auth0Logout: false, // Let users log out via Auth0
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
};

app.use(auth(config));

const [swap, swappableReactServerMiddleware] = makeSwappableMiddleware(
  reactServerMiddleware,
);

app.get("*", swappableReactServerMiddleware);

import.meta.hot?.accept("./server", () => {
  return swap(reactServerMiddleware);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
