
import { Link } from "react-router-dom";

function ForgotPassword() {
  const handleSubmit = (event) => {
    event.preventDefault();
    alert("Password reset requires connection to the authentication backend.");
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="auth-brand">CancerCare</p>
        <h1>Forgot your password?</h1>

        <p className="auth-subtitle">
          Enter the email address associated with your account.
          If an account exists, you can receive instructions to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="resetEmail">Email address</label>
          <input
            id="resetEmail"
            type="email"
            placeholder="you@example.com"
            required
          />

          <button type="submit" className="auth-button">
            Send reset instructions
          </button>
        </form>

        <p className="auth-footer">
          Remember your password? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}

export default ForgotPassword;
