
import { Link } from "react-router-dom";
import {useState} from "react";

function Register() {

    const [isCreatingAccount, setIsCreatingAccount] = useState(false);


const handleSubmit = async (event) => {
  event.preventDefault();

  setIsCreatingAccount(true);

  const form = event.currentTarget;
  const fullName = form.fullName.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;
  const confirmPassword = form.confirmPassword.value;

  if (!fullName) {
    alert("Please enter your full name.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:8000/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      const message =
        typeof result.detail === "string"
          ? result.detail
          : "Registration failed. Please check your details.";

      alert(message);
      return;
    }

    alert("Account created successfully! Please sign in.");
    window.location.href = "/login";
  } catch (error) {
    alert(
      "Could not connect to the server. Please try again."
    );
  }
  finally {
    setIsCreatingAccount(false);
  }
};

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="auth-brand">CancerCare</p>

        <h1>Create your account</h1>

        <p className="auth-subtitle">
          Begin your personal health and wellness journey.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Enter your full name"
            required
          />

          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="At least 8 characters"
            minLength={8}
            required
          />

          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            minLength={8}
            required
          />

          <button
          type="submit"
          className="auth-button"
          disabled={isCreatingAccount}
            >
          {isCreatingAccount ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}

export default Register;