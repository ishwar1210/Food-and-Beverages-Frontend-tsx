import React, { useEffect, useState } from "react";
import "./SubcategoriesSetup.css";

interface SubCategory {
  id: number;
  categoryName: string;
  subCategories: string; // single subcategory name for now
}

export default function SubcategoriesSetup(): React.ReactElement {
  const [categoryName, setCategoryName] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Sample data - replace with actual API calls
  useEffect(() => {
    // This would be replaced with actual API call
    setSubCategories([
      // Add sample data here if needed
    ]);
  }, []);

  const handleAdd = () => {
    if (!categoryName.trim() || !subCategoryName.trim()) return;
    const newSubCategory: SubCategory = {
      id: Date.now(),
      categoryName: categoryName.trim(),
      subCategories: subCategoryName.trim(),
    };
    setSubCategories((prev) => [...prev, newSubCategory]);
    setCategoryName("");
    setSubCategoryName("");
  };

  const handleEdit = (id: number) => {
    console.log("Edit sub category:", id);
    // Implement edit functionality
  };

  const handleDelete = (id: number) => {
    setSubCategories((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredSubCategories = subCategories.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.categoryName.toLowerCase().includes(q) ||
      item.subCategories.toLowerCase().includes(q)
    );
  });

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
    <div className="subcategories-container" style={{ paddingLeft: "40px" }}>
      <div className="subcategories-header">
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
            style={{ height: "38px", width: "120px", minWidth: "120px" }}
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
        </div>

        <div className="pagination-info">1-1 of 1</div>

        <div className="pagination-controls">
          <button className="pagination-btn">‹</button>
          <button className="pagination-btn">›</button>
        </div>
      </div>

      <div className="subcategories-table-container">
        <table className="subcategories-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Category Name</th>
              <th>Subcategory</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubCategories.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{ textAlign: "center", padding: "40px" }}
                >
                  No sub categories found
                </td>
              </tr>
            ) : (
              filteredSubCategories.map((item) => (
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
                  <td>{item.categoryName}</td>
                  <td>{item.subCategories}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
