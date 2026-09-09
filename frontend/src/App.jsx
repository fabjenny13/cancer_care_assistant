import AIAssistant from "./pages/AIAssistant";
import { useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet
} from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Symptoms from "./pages/Symptoms";
import Appointments from "./pages/Appointments";
import Medications from "./pages/Medications";
import Mood from "./pages/Mood";

import "./App.css";


function ProtectedLayout({ onLogout }) {

  return (
    <div className="app-layout">

      <Sidebar onLogout={onLogout} />

      <div className="content-area">

        <Outlet />

      </div>

    </div>
  );
}


function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("cancercare_logged_in") === "true"
  );


  function handleLogin() {

    setIsLoggedIn(true);

  }


  function handleLogout() {

    localStorage.removeItem("cancercare_logged_in");

    setIsLoggedIn(false);

  }


  return (
    <BrowserRouter>

      <Routes>

        {/* LOGIN */}

        <Route
          path="/login"
          element={
            isLoggedIn
              ? <Navigate to="/dashboard" replace />
              : <Login onLogin={handleLogin} />
          }
        />
        


        {/* PROTECTED PAGES */}

        <Route
          element={
            isLoggedIn
              ? <ProtectedLayout onLogout={handleLogout} />
              : <Navigate to="/login" replace />
          }
        >

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />
          <Route
  path="/ai-assistant"
  element={<AIAssistant />}
/>

          <Route
            path="/symptoms"
            element={<Symptoms />}
          />

          <Route
            path="/appointments"
            element={<Appointments />}
          />

          <Route
            path="/medications"
            element={<Medications />}
          />

          <Route
            path="/mood"
            element={<Mood />}
          />

        </Route>


        {/* DEFAULT */}

        <Route
          path="/"
          element={
            <Navigate
              to={isLoggedIn ? "/dashboard" : "/login"}
              replace
            />
          }
        />


        {/* UNKNOWN URL */}

        <Route
          path="*"
          element={
            <Navigate
              to={isLoggedIn ? "/dashboard" : "/login"}
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;