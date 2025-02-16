import React, { FC } from "react";
import { Routes, Route } from "react-router-dom";
import { Header, Sidebar, Body } from "./ui/components";
import { About, Frames, Functions, Home } from "./pages";
import styles from "./App.module.css";

const App: FC<AppProps> = ({ isAuthenticated, user }) => {
  return (
    <>
      <div className={styles.appContainer}>
        <Header className={styles.headerContainer} />
        <Sidebar
          isAuthenticated={isAuthenticated}
          user={user}
          className={styles.sidebarContainer}
        />
        <Body className={styles.bodyContainer}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/frames" element={<Frames />} />
            <Route path="/functions" element={<Functions />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Body>
      </div>
    </>
  );
};

export default App;
