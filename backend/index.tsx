import path from "path";
import express, { Request, Response } from "express";
import React from "react";
import { renderToString } from "react-dom/server";
import { auth } from "express-openid-connect";
import { StaticRouter } from "react-router-dom";
import App from "../frontend/App";

import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const config = {
  authRequired: false, // If true, all routes require authentication by default
  auth0Logout: true, // Let users log out via Auth0
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
};

app.use(auth(config));

// Serve static files from /dist (where Webpack bundles client code)
app.use(express.static(path.resolve(__dirname, "../dist")));

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

  const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>Maneki Dashboard</title>
          ${process.env.NODE_ENV !== "production" && `<script src="https://unpkg.com/react-scan/dist/auto.global.js"></script>`}
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
