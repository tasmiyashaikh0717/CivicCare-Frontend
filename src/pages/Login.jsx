
import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { requireSupabase } from "../services/supabase";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    const email = form.email.value.trim();
    const password = form.password.value;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const client = requireSupabase();

      const { data, error: authError } =
        await client.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        throw authError;
      }

      const user = data.user;

      if (!user) {
        throw new Error(
          "Unable to retrieve your account. Please sign in again."
        );
      }

      const { data: profile, error: profileError } = await client
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        throw new Error(
          `Signed in, but your profile could not be loaded: ${profileError.message}`
        );
      }

      if (!profile) {
        throw new Error(
          "Your account profile was not found. Please ask the project database teammate to check the profiles table and signup trigger."
        );
      }

      if (profile.role === "admin" || profile.role === "staff") {
        navigate("/admin-dashboard", { replace: true });
      } else if (profile.role === "citizen") {
        navigate("/dashboard", { replace: true });
      } else {
        throw new Error(
          "Your account role is not configured. Please contact the project administrator."
        );
      }
    } catch (err) {
      setError(err.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-heading">
          <span className="login-tag">CITIZEN PORTAL</span>
          <h1>Welcome Back!</h1>
          <p>Sign in to report issues and track your complaints.</p>
        </div>

        {location.state?.message && (
          <p className="complaint-message" role="status">
            {location.state.message}
          </p>
        )}

        <form onSubmit={handleLogin} noValidate>
          <div className="login-field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>

            <div className="password-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={loading}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                disabled={loading}
              >
                {showPassword ? "Hide" : "Show"}
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
            {loading ? (
              "Signing in..."
            ) : (
              <>
                Sign In <span aria-hidden="true">→</span>
              </>
            )}
          </button>
        </form>

        <div className="login-divider">
          <span>NEW TO CIVICCARE?</span>
        </div>

        <p className="register-prompt">
          Don't have an account?{" "}
          <Link to="/register">Create an account</Link>
        </p>
      </div>

      <p className="login-footer">
        Making our communities better, one report at a time.
      </p>
    </div>
  );
}

export default Login;
