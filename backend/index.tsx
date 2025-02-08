import React from "react";
import path from "path";
import express, { Request, Response } from "express";

import { renderToString } from "react-dom/server";
import { auth } from "express-openid-connect";
import { StaticRouter } from "react-router-dom";

import webpack from "webpack";
import webpackDevMiddleware from "webpack-dev-middleware";
import webpackHotMiddleware from "webpack-hot-middleware";

import App from "../frontend/App";

import dotenv from "dotenv";
dotenv.config();

const app = express();

// eslint-disable-next-line @typescript-eslint/no-require-imports
const webpackConfig = require(path.resolve("./webpack.fe.config.js"));
console.log(webpackConfig);
const compiler = webpack(webpackConfig);
app.use(
  webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    serverSideRender: true,
  }),
);

app.use(webpackHotMiddleware(compiler));

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

// Serve static files from /dist (where Webpack bundles client code)
app.use(express.static(path.resolve(__dirname, "../public")));

app.get("*", (req: Request, res: Response) => {
  const isAuthenticated = req.oidc.isAuthenticated();
  const user = req.oidc.user;

  const jsx = (
    <StaticRouter location={req.url}>
      <App isAuthenticated={isAuthenticated} user={user} />
    </StaticRouter>
  );
  const appHtml = renderToString(jsx);

  const userDataJson = JSON.stringify({ isAuthenticated, user });

  let scripts = "";
  if (process.env.NODE_ENV !== "production") {
    scripts += "\n";
    scripts +=
      '<script src="https://unpkg.com/react-scan/dist/auto.global.js"></script>';
    scripts += "\n";
  }

  const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>Frames and Functions</title>
          ${scripts}
        </head>
        <body>
          <div id="root">${appHtml}</div>
          <script>window.__INITIAL_DATA__ = ${userDataJson}</script>
          <script src="/client.bundle.js"></script>
        </body>
      </html>
     `;

  // 3) Send the rendered page back to the client
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
