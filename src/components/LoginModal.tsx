import React, { useState } from "react";
import { getToken, getAuthState } from "../services/Login";
import "./LoginModal.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [clientUsername, setClientUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }

    setLoading(true);
    try {
      const authState = await getToken(
        username,
        password,
        clientUsername || undefined
      );
      if (authState) {
        alert("✅ Login successful!");
        onLoginSuccess?.();
        onClose();
        setUsername("");
        setPassword("");
        setClientUsername("");
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUsername("");
    setPassword("");
    setClientUsername("");
    onClose();
  };

  if (!isOpen) return null;

  const currentAuth = getAuthState();

  return (
    <div className="login-modal-overlay" onClick={handleClose}>
      <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="login-modal-header">
          <h2>Login to Vibe Connect</h2>
          <button className="close-button" onClick={handleClose}>
            ×
          </button>
        </div>

        {currentAuth ? (
          <div className="login-status">
            <div className="success-message">
              ✅ Already logged in as:{" "}
              <strong>{currentAuth.tenant?.username || "User"}</strong>
            </div>
            <div className="tenant-info">
              <p>
                <strong>Tenant:</strong> {currentAuth.tenant?.alias}
              </p>
              <p>
                <strong>Client:</strong> {currentAuth.tenant?.client_username}
              </p>
            </div>
            <button className="logout-button" onClick={handleClose}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username *</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="clientUsername">Client Username (Optional)</label>
              <input
                type="text"
                id="clientUsername"
                value={clientUsername}
                onChange={(e) => setClientUsername(e.target.value)}
                placeholder="e.g. NEWHOUSE"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleClose}
                className="cancel-button"
              >
                Cancel
              </button>
              <button type="submit" disabled={loading} className="login-button">
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
