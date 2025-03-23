import "./App.css";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import TableComponent from "./components/Table";
import Debt from "./components/Debt";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import { Provider } from "react-redux";
import { store } from "./store";

const ProtectedLayout = () => {
  return (
    <div className="app">
      <Sidebar />
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
          <Route path="/debt" element={<Debt />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/*" element={<ProtectedLayout />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
