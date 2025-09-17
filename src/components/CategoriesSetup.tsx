import React, { useState, useEffect } from "react";
import { useToast } from "./toast/ToastProvider";
import {
  listCategories,
  createCategory,
  deleteCategory,
  listCuisines,
} from "../api/endpoints";

import { updateCategory } from "../api/endpoints";
import "./CategoriesSetup.css";

interface Category {
  id: number;
  name: string;
  timings?: string;
  created_at?: string;
}

interface Props {
  restaurantId?: number;
}

export default function CategoriesSetup({
  restaurantId,
}: Props): React.ReactElement {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    categoryName: "",
    timings: "",
    cuisineId: "",
    cuisineName: "",
  });
  const [cuisines, setCuisines] = useState<Array<{ id: number; name: string }>>(
    []
  );
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  // UI state for cuisine dropdown (matches screenshot: placeholder, checkbox list, Done button)
  const [showCuisineDropdown, setShowCuisineDropdown] = useState(false);
  const [selectedCuisineIds, setSelectedCuisineIds] = useState<number[]>([]);

  // Inline edit state for categories
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Partial<Category>>({});

  const toast = useToast();

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
    loadCuisines();
  }, []);

  const loadCuisines = async () => {
    try {
      let data: any = [];
      // Determine restaurant context: prop first, then try common localStorage keys
      const storedId =
        Number(
          localStorage.getItem("selectedRestaurantId") ||
            localStorage.getItem("restaurantId") ||
            localStorage.getItem("currentRestaurantId") ||
            "0"
        ) || undefined;
      const effectiveRestaurantId = restaurantId ?? storedId;

      // Always use restaurant-scoped cuisines endpoint.
      // If we have an effective restaurant id, request cuisines for that restaurant;
      // otherwise load all cuisines from /api/cuisines/ (no master-cuisines fallback).
      if (effectiveRestaurantId) {
        data = await listCuisines({ restaurant: effectiveRestaurantId });
      } else {
        data = await listCuisines();
      }
      // normalize to [{id, name}]
      const normalized = Array.isArray(data)
        ? data.map((c: any) => ({
            id: c.id ?? c.pk ?? c.value ?? 0,
            name: c.name ?? c.title ?? c.label ?? String(c),
          }))
        : [];
      setCuisines(normalized.filter((c: any) => c.id));
    } catch (err) {
      console.debug("Failed to load cuisines for category select", err);
      setCuisines([]);
    }
  };

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

  // use the same input handler for text inputs (including cuisineName)
  // For datalist selection, we'll map the name back to an id when submitting

  const handleAdd = async () => {
    if (!formData.categoryName.trim()) {
      toast.warning("Please enter a category name");
      return;
    }

    try {
      const timingsValue = formData.timings.trim();
      // Build payload with multiple possible timing keys to match backend expectations
      const payload: any = { name: formData.categoryName.trim() };
      if (timingsValue) {
        // primary timing key the backend expects
        payload.timing = timingsValue;
        // compatibility keys
        payload.timings = timingsValue;
        payload.time = timingsValue;
        payload.opening_hours = timingsValue;
        payload.schedule = timingsValue;
      }

      // resolve cuisine id from selection (either stored id or by matching name)
      let cuisineIdResolved: number | undefined;
      if (formData.cuisineId) cuisineIdResolved = Number(formData.cuisineId);
      else if (formData.cuisineName) {
        const found = cuisines.find(
          (c) =>
            c.name.toLowerCase() === formData.cuisineName.trim().toLowerCase()
        );
        if (found) cuisineIdResolved = found.id;
      }

      if (cuisineIdResolved) {
        // send restaurant-cuisine id(s) as an array under `cuisines` (preferred)
        payload.cuisines = [cuisineIdResolved];
        // also include singular keys for compatibility
        payload.cuisine = cuisineIdResolved;
        payload.cuisine_id = cuisineIdResolved;
      }

      console.debug("Creating category with payload", payload);
      const newCategory = await createCategory(payload);
      console.debug("createCategory response", newCategory);

      // Add to local state
      setCategories((prev) => [...prev, newCategory]);

      // Reset form (include cuisineId and cuisineName since they're part of formData)
      setFormData({
        categoryName: "",
        timings: "",
        cuisineId: "",
        cuisineName: "",
      });

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

  const startEdit = (category: Category) => {
    // initialize timings from common backend keys
    const initialTimings =
      (category as any).timings ??
      (category as any).time ??
      (category as any).schedule ??
      (category as any).opening_hours ??
      (category as any).timing ??
      (category as any).hours ??
      (category as any).created_at ??
      "";
    setEditingId(category.id);
    setEditValues({ name: category.name, timings: initialTimings });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const saveEdit = async (id: number) => {
    if (!editValues.name || !editValues.name.trim()) {
      toast.warning("Category name cannot be empty");
      return;
    }
    const payload: any = { name: editValues.name.trim() };
    if (editValues.timings) payload.timings = editValues.timings;

    // optimistic update
    const prev = categories;
    setCategories((prevCats) =>
      prevCats.map((c) =>
        c.id === id
          ? ({
              ...c,
              name: payload.name,
              timings: payload.timings,
              time: payload.time,
              timing: payload.timing,
              opening_hours: payload.opening_hours,
              schedule: payload.schedule,
            } as any)
          : c
      )
    );

    try {
      const res: any = await updateCategory(id, payload);
      // merge server response if provided
      if (res) {
        setCategories((prevCats) =>
          prevCats.map((c) => (c.id === id ? { ...c, ...res } : c))
        );
      }
      setEditingId(null);
      setEditValues({});
      toast.success("Category updated");
    } catch (err) {
      console.error("Failed to update category", err);
      setCategories(prev);
      toast.error("Failed to update category");
    }
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

  // Helper to resolve timings from different possible backend keys
  const resolveTimings = (cat: any): string => {
    if (!cat) return "-";
    const candidates = [
      cat.timings,
      cat.time,
      cat.schedule,
      cat.menuType,
      cat.opening_hours,
      cat.hours,
      cat.timing,
    ];
    for (const c of candidates) {
      if (typeof c === "string" && c.trim() !== "") return c;
      if (typeof c === "object" && c !== null) {
        // If backend returns an object, try common subkeys
        if (typeof c.text === "string" && c.text.trim() !== "") return c.text;
        if (typeof c.value === "string" && c.value.trim() !== "")
          return c.value;
      }
    }
    return "-";
  };

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
          {/* Cuisine dropdown (select-like) */}
          <div
            className="cuisine-dropdown-wrapper"
            style={{ position: "relative" }}
          >
            <button
              type="button"
              className="cuisine-select-btn"
              onClick={() => setShowCuisineDropdown((s) => !s)}
            >
              <span style={{ color: formData.cuisineName ? "#333" : "#777" }}>
                {formData.cuisineName && formData.cuisineName.length > 0
                  ? formData.cuisineName
                  : "Select cuisine"}
              </span>
              <span style={{ marginLeft: 8 }}>▾</span>
            </button>

            {showCuisineDropdown && (
              <div
                className="cuisine-dropdown-panel"
                style={{
                  position: "absolute",
                  top: "110%",
                  left: 0,
                  width: 300,
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                  zIndex: 50,
                  padding: 12,
                }}
              >
                <div style={{ maxHeight: 180, overflow: "auto" }}>
                  {cuisines.map((c) => (
                    <label
                      key={c.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 4px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCuisineIds.includes(c.id)}
                        onChange={() => {
                          setSelectedCuisineIds((prev) =>
                            prev.includes(c.id)
                              ? prev.filter((x) => x !== c.id)
                              : [...prev, c.id]
                          );
                        }}
                      />
                      <span style={{ color: "#444" }}>{c.name}</span>
                    </label>
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 8,
                  }}
                >
                  <button
                    type="button"
                    className="cuisine-done-btn"
                    onClick={() => {
                      // set first selected as cuisineId (backwards-compatible) and join names
                      const firstId = selectedCuisineIds[0];
                      const names = cuisines
                        .filter((c) => selectedCuisineIds.includes(c.id))
                        .map((c) => c.name)
                        .join(", ");
                      setFormData((prev) => ({
                        ...prev,
                        cuisineId: firstId ? String(firstId) : "",
                        cuisineName: names,
                      }));
                      setShowCuisineDropdown(false);
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
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
                    {editingId === category.id ? (
                      <>
                        <button
                          className="action-btn edit-btn"
                          title="Save"
                          onClick={() => saveEdit(category.id)}
                        >
                          Save
                        </button>
                        <button
                          className="action-btn delete-btn"
                          title="Cancel"
                          onClick={() => cancelEdit()}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="action-btn edit-btn"
                          title="Edit"
                          onClick={() => startEdit(category)}
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
                          {deletingIds.has(category.id) ? (
                            "..."
                          ) : (
                            <DeleteIcon />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </td>
                <td>
                  {editingId === category.id ? (
                    <input
                      value={String(editValues.name ?? category.name)}
                      onChange={(e) =>
                        setEditValues((s) => ({ ...s, name: e.target.value }))
                      }
                    />
                  ) : (
                    category.name
                  )}
                </td>
                <td>
                  {editingId === category.id ? (
                    <input
                      value={String(
                        editValues.timings ?? category.created_at ?? ""
                      )}
                      onChange={(e) =>
                        setEditValues((s) => ({
                          ...s,
                          timings: e.target.value,
                        }))
                      }
                    />
                  ) : (
                    resolveTimings(category)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
