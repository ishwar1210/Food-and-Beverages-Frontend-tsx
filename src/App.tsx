import React, { useState } from "react";
import "./App.css";
import Header from "./layout/Navbar";
import Breadcrumb from "./layout/Breadcrumb";
import Resto_options from "./components/Restooptions";
import SubNavigation from "./components/SubNavigation";
import Addrestaurant from "./components/Addrestaurant";
import CategoriesSetup from "./components/CategoriesSetup";
import SubcategoriesSetup from "./components/SubcategoriesSetup";
import RestaurantMenu from "./components/Restaurantmenu";

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
        return <CategoriesSetup />;
      case 4:
        return <SubcategoriesSetup />;
      case 5:
        return <RestaurantMenu />;
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
