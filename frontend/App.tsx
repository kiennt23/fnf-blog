import React, { FC } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import { Sidebar } from "./ui/components";

const App: FC<AppProps> = ({ isAuthenticated, user }) => {
  return (
    <>
      <Sidebar isAuthenticated={isAuthenticated} user={user} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </>
  );
};

export default App;
