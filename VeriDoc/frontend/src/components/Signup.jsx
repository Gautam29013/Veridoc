

import React, { useState } from "react";
import { Link } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Signup:", { email, password });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        
        <div className="logo"></div>

        <h2 className="auth-title">Welcome</h2>
        <p className="auth-subtitle">
          Create your account to get started
        </p>

        <button className="social-btn">
          🔵 Log In with Google
        </button>

        {/* <button className="social-btn">
          ⚫ Login with Github
        </button> */}

        <div className="divider">
          <span>OR</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email *</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group password-wrapper">
            <label>Password *</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁"}
            </span>
          </div>

          <div className="checkbox">
            <input type="checkbox" required />
            <span>
              I agree with <a href="#">Terms</a> and{" "}
              <a href="#">Privacy Policy</a>
            </span>
          </div>

          <button type="submit" className="submit-btn">
            Sign Up
          </button>
        </form>

        <p className="bottom-text">
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
