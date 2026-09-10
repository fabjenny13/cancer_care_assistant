import AIAssistant from "./pages/AIAssistant";
import { useEffect, useState } from "react";

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

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);


  // Check authentication whenever the app loads
  useEffect(() => {

    async function checkAuth() {

      const token = localStorage.getItem("access_token");

      // No token -> definitely not logged in
      if (!token) {
        setIsLoggedIn(false);
        setCheckingAuth(false);
        return;
      }

      try {

        const response = await fetch("http://localhost:8000/auth/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {

          // Token is valid
          setIsLoggedIn(true);

        } else {

          // Token is invalid/expired
          localStorage.removeItem("access_token");
          setIsLoggedIn(false);

        }

      } catch (error) {

        console.error("Authentication check failed:", error);

        setIsLoggedIn(false);

      } finally {

        setCheckingAuth(false);

      }
    }

    checkAuth();

  }, []);


  function handleLogin() {

    setIsLoggedIn(true);

  }


  function handleLogout() {

    localStorage.removeItem("access_token");

    setIsLoggedIn(false);

  }


  // Don't redirect anywhere until we know the authentication state
  if (checkingAuth) {
    return <div>Loading...</div>;
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