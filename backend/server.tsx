import React from "react";
import { Request, Response } from "express";
import { StaticRouter } from "react-router-dom";
import { renderToString } from "react-dom/server";
import App from "../frontend/App";

const reactServerMiddleware = (req: Request, res: Response) => {
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
};

export default reactServerMiddleware;
