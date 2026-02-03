import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = () => {
    logout();
    nav("/login");
  };

  if (!isAuthenticated || !user) return null;

  return (
    <nav className="navbar">
      <div className="logo">Mentora</div>

      <div className="nav-actions">
        {user.role === "student" && (
          <Link
            to="/missions"
            className="btn btn-secondary"
            style={{ padding: "8px 14px", textDecoration: "none" }}
          >
            Küldetések
          </Link>
        )}
        {user.role === "teacher" && (
          <Link
            to="/results"
            className="btn btn-secondary"
            style={{ padding: "8px 14px", textDecoration: "none" }}
          >
            Eredmények
          </Link>
        )}
        <div className="user-badge">
          <span>{user.role === "teacher" ? "👨‍🏫" : "🎓"}</span>
          <span>{user.email}</span>
        </div>
        
        <button className="logout-btn" onClick={handleLogout}>
          Kijelentkezés
        </button>
      </div>
    </nav>
  );
};
