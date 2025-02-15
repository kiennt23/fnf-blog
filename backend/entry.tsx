import React, { StrictMode } from "react";
import { StaticRouter } from "react-router-dom";
import { renderToString } from "react-dom/server";
import App from "../frontend/App";

export const render = (url: string, initialState: AppProps) => {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App
          isAuthenticated={initialState.isAuthenticated}
          user={initialState.user}
        />
      </StaticRouter>
    </StrictMode>,
  );
};
