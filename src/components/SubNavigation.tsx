import { useState } from "react";
import "./SubNavigation.css";

interface Props {
  onChange?: (index: number) => void;
  initialIndex?: number;
}

export default function SubNavigation({ onChange, initialIndex = 0 }: Props) {
  const subMenuItems = ["POS", "New Table", "New Order"];
  const [activeSubIndex, setActiveSubIndex] = useState<number>(initialIndex);

  const handleSubItemClick = (index: number) => {
    setActiveSubIndex(index);
    if (onChange) onChange(index);
  };

  return (
    <div className="sub-nav-container">
      <div className="sub-nav-wrapper">
        {subMenuItems.map((item, index) => (
          <div
            key={index}
            className={`sub-nav-item ${
              index === activeSubIndex ? "active" : ""
            }`}
            onClick={() => handleSubItemClick(index)}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
