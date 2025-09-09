import React, { useState } from "react";
import "./App.css";
import Header from "./layout/Navbar";
import Breadcrumb from "./layout/Breadcrumb";
import Resto_options from "./components/Restooptions";
import SubNavigation from "./components/SubNavigation";
import Addrestaurant from "./components/Addrestaurant";

export default function App(): React.ReactElement {
  const [activeMainTab, setActiveMainTab] = useState<number>(0);

  const handleMainTabChange = (index: number) => {
    setActiveMainTab(index);
  };

  const renderContent = () => {
    switch (activeMainTab) {
      case 0:
        return <SubNavigation />;
      case 1:
        return <Addrestaurant />;
      case 2:
        return (
          <div style={{ padding: "20px", color: "#666" }}>
            Status Setup Content
          </div>
        );
      case 3:
        return (
          <div style={{ padding: "20px", color: "#666" }}>
            Categories Setup Content
          </div>
        );
      case 4:
        return (
          <div style={{ padding: "20px", color: "#666" }}>
            Sub Categories Setup Content
          </div>
        );
      case 5:
        return (
          <div style={{ padding: "20px", color: "#666" }}>
            Restaurant Menu Content
          </div>
        );
      case 6:
        return (
          <div style={{ padding: "20px", color: "#666" }}>
            Restaurant Bookings Content
          </div>
        );
      default:
        return <SubNavigation />;
    }
  };

  return (
    <>
      <Header />
      <Breadcrumb />
      <Resto_options
        onTabChange={handleMainTabChange}
        activeTab={activeMainTab}
      />
      {renderContent()}
    </>
  );
}
