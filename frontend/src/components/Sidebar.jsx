import { NavLink } from "react-router-dom";

function Sidebar({ onLogout }) {

  return (
    <aside className="sidebar">

      {/* Logo */}

      <div className="sidebar-logo">

        <div className="logo-icon">
          💙
        </div>

        <div>
          <h2>CancerCare</h2>
          <span>Patient Portal</span>
        </div>

      </div>


      {/* Navigation */}

      <div className="sidebar-section">

        <p className="sidebar-title">
          MAIN MENU
        </p>

        <nav>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? "nav-item active"
                : "nav-item"
            }
          >
            <span className="nav-icon">🏠</span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink
  to="/ai-assistant"
  className={({ isActive }) =>
    isActive
      ? "nav-item active"
      : "nav-item"
  }
>
  <span className="nav-icon">🤖</span>
  <span>AI Assistant</span>
</NavLink>


          <NavLink
            to="/symptoms"
            className={({ isActive }) =>
              isActive
                ? "nav-item active"
                : "nav-item"
            }
          >
            <span className="nav-icon">🩺</span>
            <span>Symptom Diary</span>
          </NavLink>


          <NavLink
            to="/appointments"
            className={({ isActive }) =>
              isActive
                ? "nav-item active"
                : "nav-item"
            }
          >
            <span className="nav-icon">📅</span>
            <span>Appointments</span>
          </NavLink>


          <NavLink
            to="/medications"
            className={({ isActive }) =>
              isActive
                ? "nav-item active"
                : "nav-item"
            }
          >
            <span className="nav-icon">💊</span>
            <span>Medications</span>
          </NavLink>


          <NavLink
            to="/mood"
            className={({ isActive }) =>
              isActive
                ? "nav-item active"
                : "nav-item"
            }
          >
            <span className="nav-icon">😊</span>
            <span>Mood & Wellness</span>
          </NavLink>

        </nav>

      </div>


      {/* Bottom */}

      <div className="sidebar-bottom">

        <div className="nav-item">
          <span className="nav-icon">⚙️</span>
          <span>Settings</span>
        </div>

        <div className="nav-item">
          <span className="nav-icon">❓</span>
          <span>Help & Support</span>
        </div>

      </div>


      {/* User */}
<div className="sidebar-user">

  <div className="user-avatar">
    P
  </div>

  <div className="sidebar-user-info">

    <strong>Patient</strong>

    <span>My Account</span>

  </div>

  <button
    className="logout-button"
    onClick={onLogout}
    title="Logout"
  >
    ↪
  </button>

</div>

    </aside>
  );
}

export default Sidebar;
