import React, { FC } from "react";
import { Routes, Route, useParams, useLocation } from "react-router-dom";
import { Monitoring } from "react-scan/monitoring";
import Home from "./pages/Home";
import About from "./pages/About";
import { NewSidebar } from "./ui/components";

type AppProps = {
  isAuthenticated?: boolean;
  user?: { name?: string };
};

const App: FC<AppProps> = ({ isAuthenticated, user }) => {
  const params = useParams();
  let location = useLocation();

  return (
    <>
      <div>
        <NewSidebar isAuthenticated={isAuthenticated} user={user} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
      <Monitoring
        apiKey="1plqbQ0CGnsfbk4X63OgPa3jIN8dfPfO"
        url="https://monitoring.react-scan.com/api/v1/ingest"
        params={params as unknown as Record<string, string>}
        path={location.pathname}
      />
    </>
  );
};

export default App;
