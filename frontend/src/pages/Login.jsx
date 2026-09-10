import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ onLogin }) {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event) {

    event.preventDefault();

    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    // Demo login
    localStorage.setItem("cancercare_logged_in", "true");

    onLogin();

    navigate("/dashboard");
  }

  return (
    <div className="login-page">

      {/* Left Side */}

      <div className="login-left">

        <div className="login-brand">

          <div className="login-logo">
            💙
          </div>

          <div>
            <h2>CancerCare</h2>
            <span>Patient Support Portal</span>
          </div>

        </div>


        <div className="login-message">

          <span className="login-small-title">
            YOUR HEALTH. YOUR JOURNEY.
          </span>

          <h1>
            Compassionate support,
            <br />
            whenever you need it.
          </h1>

          <p>
            CancerCare brings your symptoms, appointments,
            medications, wellness and support tools together
            in one secure patient-friendly space.
          </p>

          <div className="login-features">

            <div className="login-feature">
              <span>🩺</span>
              <div>
                <strong>Track your health</strong>
                <p>Keep your symptoms and wellness information organized.</p>
              </div>
            </div>

            <div className="login-feature">
              <span>📅</span>
              <div>
                <strong>Stay organized</strong>
                <p>Manage appointments and medication schedules.</p>
              </div>
            </div>

            <div className="login-feature">
              <span>🤖</span>
              <div>
                <strong>AI-powered support</strong>
                <p>Get helpful guidance from your AI assistant.</p>
              </div>
            </div>

          </div>

        </div>


        <div className="login-footer">
          © 2026 CancerCare Patient Portal
        </div>

      </div>


      {/* Right Side */}

      <div className="login-right">

        <div className="login-card">

          <div className="login-card-header">

            <div className="welcome-icon">
              👋
            </div>

            <h1>
              Welcome back
            </h1>

            <p>
              Sign in to continue your health journey.
            </p>

          </div>


          <form onSubmit={handleSubmit}>

            <div className="login-form-group">

              <label>
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
              />

            </div>


            <div className="login-form-group">

              <div className="password-label">

                <label>
                  Password
                </label>

                <button
                  type="button"
                  className="forgot-button"
                  onClick={() =>
                    alert("Password recovery will be available after backend integration.")
                  }
                >
                  Forgot password?
                </button>

              </div>


              <div className="password-input">

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>

              </div>

            </div>


            <label className="remember-me">

              <input type="checkbox" />

              <span>
                Remember me
              </span>

            </label>


            <button
              type="submit"
              className="login-button"
            >
              Sign In
              <span>→</span>
            </button>

          </form>


          <div className="login-divider">
            <span>OR</span>
          </div>


          <div className="create-account">

            <p>
              Don't have an account?
            </p>

            <button
              onClick={() =>
                alert("Registration will be connected to the backend later.")
              }
            >
              Create an account
            </button>

          </div>


          <div className="login-security">

            <span>🔒</span>

            <p>
              Your health information is handled with care.
              This demo login will be replaced with secure
              backend authentication.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;