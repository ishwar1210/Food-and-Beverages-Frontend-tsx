import { logout } from "../services/Login";
import "./LogoutButton.css";

interface Props {
  onLogoutSuccess?: () => void;
}

export default function LogoutButton({ onLogoutSuccess }: Props) {
  const handleLogout = async () => {
    try {
      console.log("🚪 Logout button clicked");
      await logout();
      console.log("✅ Logout successful");

      // Call the success callback if provided
      onLogoutSuccess?.();

      // Optional: Refresh the page to clear any remaining state
      window.location.reload();
    } catch (error) {
      console.error("❌ Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <button className="logout-button" onClick={handleLogout} title="Logout">
      <svg
        className="logout-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16,17 21,12 16,7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      Logout
    </button>
  );
}
