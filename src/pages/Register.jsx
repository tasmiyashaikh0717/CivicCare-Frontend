
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { requireSupabase } from "../services/supabase";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    const form = e.currentTarget;
    const fullName = form.fullName.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    // Validate full name
    if (fullName.length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return;
    }

    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    setLoading(true);

    try {
      const client = requireSupabase();

      const { data, error: signUpError } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            name: fullName,
            role: "citizen",
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.session) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/login", {
          replace: true,
          state: {
            message:
              "Account created. Check your email to confirm your address, then sign in.",
          },
        });
      }
    } catch (err) {
      setError(
        err.message || "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page register-page">
      <Link to="/" className="login-brand">
        <span className="brand-icon">C</span>
        CivicCare
      </Link>

      <div className="login-box register-box">
        <div className="login-heading">
          <span className="login-tag">CITIZEN PORTAL</span>
          <h1>Create Account</h1>
          <p>Join CivicCare and help improve your community.</p>
        </div>

        <form onSubmit={handleRegister} noValidate>
          <div className="login-field">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              autoComplete="name"
              minLength={2}
              required
              disabled={loading}
            />
          </div>

          <div className="login-field">
            <label htmlFor="registerEmail">Email Address</label>
            <input
              id="registerEmail"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>

          <div className="login-field">
            <label htmlFor="registerPassword">Password</label>
            <div className="password-wrapper">
              <input
                id="registerPassword"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                minLength={8}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={loading}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-wrapper">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword((previous) => !previous)
                }
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
                disabled={loading}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <p className="register-error" role="alert" aria-live="polite">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
            {!loading && <span aria-hidden="true"> →</span>}
          </button>
        </form>

        <div className="login-divider">
          <span>ALREADY REGISTERED?</span>
        </div>

        <p className="register-prompt">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>

        <Link to="/" className="back-home">
          ← Back to Home
        </Link>
      </div>

      <p className="login-footer">
        Making our communities better, one report at a time.
      </p>
    </div>
  );
}

export default Register;
