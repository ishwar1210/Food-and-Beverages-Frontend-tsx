import type { ReactElement } from "react";
import "./Breadcrumb.css";

const HomeIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

export default function Breadcrumb(): ReactElement {
  return (
    <div className="breadcrumb-container">
      <div className="breadcrumb-wrapper">
        <div className="breadcrumb-item">
          <HomeIcon size={16} />
          <span>Setup</span>
        </div>
        <div className="breadcrumb-separator">
          <HomeIcon size={16} />
        </div>
        <div className="breadcrumb-item active">
          <span>F&B</span>
        </div>
      </div>
    </div>
  );
}
