import React, { useState, useEffect } from "react";
import { useToast } from "./toast/ToastProvider";
import {
  listCategories,
  createCategory,
  deleteCategory,
} from "../api/endpoints";
import "./CategoriesSetup.css";

interface Category {
  id: number;
  name: string;
  timings?: string;
  created_at?: string;
}

export default function CategoriesSetup(): React.ReactElement {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    categoryName: "",
    timings: "",
  });
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  const toast = useToast();

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await listCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load categories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = async () => {
    if (!formData.categoryName.trim()) {
      toast.warning("Please enter a category name");
      return;
    }

    try {
      const payload = {
        name: formData.categoryName.trim(),
        timings: formData.timings.trim() || null,
      };

      const newCategory = await createCategory(payload);

      // Add to local state
      setCategories((prev) => [...prev, newCategory]);

      // Reset form
      setFormData({ categoryName: "", timings: "" });

      toast.success("Category added successfully");
    } catch (error) {
      toast.error("Failed to add category");
    }
  };

  const handleDelete = (id: number) => {
    toast.confirm({
      title: "Confirm Delete",
      message: "Are you sure you want to delete this category?",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        setDeletingIds((prev) => new Set(prev).add(id));
        try {
          await deleteCategory(id);
          setCategories((prev) => prev.filter((cat) => cat.id !== id));
          toast.success("Category deleted successfully");
        } catch (error) {
          toast.error("Failed to delete category");
        } finally {
          setDeletingIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }
      },
    });
  };

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
    <div className="categories-setup-container">
      {/* Header with Add Form */}
      <div className="categories-header">
        <div className="add-category-form">
          <button className="btn-add" onClick={handleAdd} disabled={loading}>
            Add
          </button>
          <input
            type="text"
            name="categoryName"
            value={formData.categoryName}
            onChange={handleInputChange}
            placeholder="Enter Category Name"
            className="input-category-name"
          />
          <input
            type="text"
            name="timings"
            value={formData.timings}
            onChange={handleInputChange}
            placeholder="Enter Timings"
            className="input-timings"
          />
        </div>

        {/* Pagination Info */}
        <div className="pagination-info">
          {loading
            ? "Loading..."
            : `1-${categories.length} of ${categories.length}`}
        </div>

        {/* Pagination Controls */}
        <div className="pagination-controls">
          <button className="pagination-btn">‹</button>
          <button className="pagination-btn">›</button>
        </div>
      </div>

      {/* Categories Table */}
      <div className="categories-table-container">
        <table className="categories-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Category Name</th>
              <th>Timings</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={3} style={{ textAlign: "center" }}>
                  Loading...
                </td>
              </tr>
            )}
            {!loading && categories.length === 0 && (
              <tr>
                <td colSpan={3} style={{ textAlign: "center" }}>
                  No categories found
                </td>
              </tr>
            )}
            {categories.map((category) => (
              <tr key={category.id}>
                <td>
                  <div className="action-icons">
                    <button
                      className="action-btn edit-btn"
                      title="Edit"
                      onClick={() =>
                        toast.info("Edit functionality coming soon")
                      }
                    >
                      <EditIcon />
                    </button>
                    <button
                      className="action-btn delete-btn"
                      title="Delete"
                      onClick={() => handleDelete(category.id)}
                      disabled={deletingIds.has(category.id)}
                      style={
                        deletingIds.has(category.id)
                          ? { opacity: 0.5, cursor: "not-allowed" }
                          : undefined
                      }
                    >
                      {deletingIds.has(category.id) ? "..." : <DeleteIcon />}
                    </button>
                  </div>
                </td>
                <td>{category.name}</td>
                <td>{category.timings || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
