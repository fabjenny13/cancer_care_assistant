
import { Link } from "react-router-dom";

function Register() {
  const handleSubmit = (event) => {
    event.preventDefault();

    const password = event.target.password.value;
    const confirmPassword = event.target.confirmPassword.value;

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    alert(
      "The registration form works! Connect it to your authentication backend to create an account."
    );
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

          <button type="submit" className="auth-button">
            Create account
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
