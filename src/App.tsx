import React from "react";
import Sidebar from "./components/Sidebar";
import "./App.css";
import Dashboard from "./components/Dashboard";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import TableComponent from "./components/Table";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar />
        {/* Sidebar */}
        {/* Main Content Area */}
        <div className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  userName="John Doe"
                  profilePicture="https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250"
                  notificationCount={3}
                />
              }
            />
            <Route path="/table" element={<TableComponent />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
