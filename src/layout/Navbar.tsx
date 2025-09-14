import { useState, useEffect } from "react";
import "../App.css";
import profileImg from "../assets/bc9fd4bd-de9b-4555-976c-8360576c6708.jpg";
import "./Navbar.css";
import LoginModal from "../components/LoginModal";
import LogoutButton from "../components/LogoutButton";
import { isLoggedIn, getCurrentUser } from "../services/Login";
// Inline SVG icons to avoid relying on FontAwesome packages
const BellIcon = ({
  className = "",
  size = 20,
}: {
  className?: string;
  size?: number;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    style={{ color: "white" }}
  >
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const GearIcon = ({
  className = "",
  size = 20,
}: {
  className?: string;
  size?: number;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    style={{ color: "white" }}
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09A1.65 1.65 0 0 0 9 3.09V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const ProfileIcon = ({
  className = "",
  size = 20,
}: {
  className?: string;
  size?: number;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    style={{ color: "white" }}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

function Navbar() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Check auth status on component mount and when login state changes
  useEffect(() => {
    const checkAuthStatus = () => {
      setUserLoggedIn(isLoggedIn());
      setCurrentUser(getCurrentUser());
    };

    checkAuthStatus();

    // Add event listener for storage changes (in case user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleProfileClick = () => {
    if (userLoggedIn) {
      // If logged in, show user info (you can add a dropdown here)
      console.log("User info:", currentUser);
    } else {
      // If not logged in, open login modal
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    console.log("User logged in successfully");
    setUserLoggedIn(true);
    setCurrentUser(getCurrentUser());
    setIsLoginModalOpen(false);
  };

  const handleLogoutSuccess = () => {
    console.log("User logged out successfully");
    setUserLoggedIn(false);
    setCurrentUser(null);
  };

  return (
    <>
      <nav
        className="navbar navbar-expand-lg navbar-dark bg-primary custom-navbar"
        style={{ margin: 0, padding: "12px 24px" }}
      >
        {/* Left Section */}
        <div className="d-flex align-items-center">
          <img
            src={profileImg}
            alt="Profile"
            className="rounded-circle me-2"
            style={{ width: "60px", height: "60px" }}
          />
          <span
            className="text-white"
            style={{
              fontSize: "1.8rem",
              fontWeight: "500",
              fontFamily: "Arial, sans-serif",
              letterSpacing: "0.7px",
            }}
          >
            Vibe Connect
          </span>
        </div>

        {/* Right Section */}
        <div className="ms-auto d-flex align-items-center gap-3">
          <BellIcon className="icon" />
          <GearIcon className="icon" />
          {/* Show profile icon only when user is NOT logged in (acts as login trigger) */}
          {!userLoggedIn && (
            <div onClick={handleProfileClick} style={{ cursor: "pointer" }}>
              <ProfileIcon className="icon" />
            </div>
          )}

          {/* Show logout button only when user is logged in */}
          {userLoggedIn && (
            <LogoutButton onLogoutSuccess={handleLogoutSuccess} />
          )}

          {/* User welcome message removed per design request */}
        </div>
      </nav>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}

export default Navbar;
