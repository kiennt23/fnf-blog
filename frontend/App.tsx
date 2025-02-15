import React, { FC } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import { Header, Sidebar, Body } from "./ui/components";

const App: FC<AppProps> = ({ isAuthenticated, user }) => {
  return (
    <>
      <div>
        <Header />
        <Sidebar isAuthenticated={isAuthenticated} user={user} />
        <Body>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Body>
      </div>
    </>
  );
};

export default App;
