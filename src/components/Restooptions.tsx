import { useEffect, useState } from "react";
import "./Restooptions.css";

interface Props {
  onTabChange?: (index: number) => void;
  activeTab?: number;
}

export default function Resto_options({ onTabChange, activeTab }: Props) {
  const menuItems: string[] = [
    "Restaurant Orders",
    "Restaurant",
    "Status Setup",
    "Categories Setup",
    "Sub Categories Setup",
    "Restaurant Menu",
    "Restaurant Bookings",
  ];

  const [activeIndex, setActiveIndex] = useState<number>(activeTab ?? 0);

  const handleItemClick = (index: number) => {
    setActiveIndex(index);
    if (onTabChange) onTabChange(index);
  };

  useEffect(() => {
    setActiveIndex(activeTab ?? 0);
  }, [activeTab]);

  return (
    <div className="resto-options-container">
      <nav className="resto-nav">
        <div className="resto-nav-wrapper">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className={`resto-nav-item ${
                index === activeIndex ? "active" : ""
              }`}
              onClick={() => handleItemClick(index)}
            >
              {item}
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}
