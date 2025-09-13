import React, { useEffect, useState } from "react";
import "./Restaurantmenu.css";

interface MenuItem {
  id: number;
  products: string;
  masterPrice: number;
  displayPrice: number;
  category: string;
  subCategory: string;
  menuType: string;
  discount: number;
  createdOn: string;
  updatedOn: string;
  status: "active" | "inactive";
}

export default function RestaurantMenu(): React.ReactElement {
  const [categoryName, setCategoryName] = useState("");
  const [timings, setTimings] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Sample data - replace with actual API calls
  useEffect(() => {
    // This would be replaced with actual API call
    setMenuItems([
      // Add sample data here if needed
    ]);
  }, []);

  const handleAdd = () => {
    if (categoryName.trim() && timings.trim()) {
      const newMenuItem: MenuItem = {
        id: Date.now(),
        products: categoryName.trim(),
        masterPrice: 0,
        displayPrice: 0,
        category: "",
        subCategory: "",
        menuType: timings.trim(),
        discount: 0,
        createdOn: new Date().toLocaleDateString(),
        updatedOn: new Date().toLocaleDateString(),
        status: "active",
      };

      setMenuItems((prev) => [...prev, newMenuItem]);
      setCategoryName("");
      setTimings("");
    }
  };

  const handleEdit = (id: number) => {
    console.log("Edit menu item:", id);
    // Implement edit functionality
  };

  const handleDelete = (id: number) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredMenuItems = menuItems.filter(
    (item) =>
      item.products.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subCategory.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Icon components
  const SearchIcon = ({ size = 16 }: { size?: number }) => (
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
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );

  const EditIcon = ({ size = 16 }: { size?: number }) => (
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
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );

  const DeleteIcon = ({ size = 16 }: { size?: number }) => (
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
      <polyline points="3,6 5,6 21,6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );

  return (
    <div className="restaurant-menu-container" style={{ paddingLeft: "40px" }}>
      <div className="restaurant-menu-header">
        <div className="search-container">
          <SearchIcon />
          <input
            type="text"
            placeholder=""
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button className="add-btn" onClick={handleAdd}>
          Add
        </button>

        <div className="form-inputs">
          <input
            type="text"
            placeholder="Enter Category Name"
            className="form-input"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter Timings"
            className="form-input"
            value={timings}
            onChange={(e) => setTimings(e.target.value)}
          />
        </div>

        <div className="pagination-info">1-1 of 1</div>

        <div className="pagination-controls">
          <button className="pagination-btn">‹</button>
          <button className="pagination-btn">›</button>
        </div>
      </div>

      <div className="restaurant-menu-table-container">
        <table className="restaurant-menu-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Products</th>
              <th>Master Price</th>
              <th>Display Price</th>
              <th>Category</th>
              <th>Sub Category</th>
              <th>Menu Type</th>
              <th>Discount</th>
              <th>Created On</th>
              <th>Updated On</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredMenuItems.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  style={{ textAlign: "center", padding: "40px" }}
                >
                  No menu items found
                </td>
              </tr>
            ) : (
              filteredMenuItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="action-icons">
                      <button
                        className="action-btn edit-btn"
                        title="Edit"
                        onClick={() => handleEdit(item.id)}
                      >
                        <EditIcon />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        title="Delete"
                        onClick={() => handleDelete(item.id)}
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </td>
                  <td>{item.products}</td>
                  <td>₹{item.masterPrice}</td>
                  <td>₹{item.displayPrice}</td>
                  <td>{item.category}</td>
                  <td>{item.subCategory}</td>
                  <td>{item.menuType}</td>
                  <td>{item.discount}%</td>
                  <td>{item.createdOn}</td>
                  <td>{item.updatedOn}</td>
                  <td>
                    <span className={`status ${item.status}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
