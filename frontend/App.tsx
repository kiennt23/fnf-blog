import React, { FC } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import { NewSidebar } from "./ui/components";

type AppProps = {
  isAuthenticated?: boolean;
  user?: { name?: string };
};

const App: FC<AppProps> = ({ isAuthenticated, user }) => {
  return (
    <>
      <div>
        <NewSidebar isAuthenticated={isAuthenticated} user={user} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
