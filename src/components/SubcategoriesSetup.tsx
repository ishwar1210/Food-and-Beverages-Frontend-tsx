import React, { useEffect, useState } from "react";
import { listCuisines, listCategories } from "../api/endpoints";
import "./SubcategoriesSetup.css";

interface SubCategory {
  id: number | string;
  categoryName: string;
  cuisineName: string; // one cuisine name (we render one row per relation)
}

export default function SubcategoriesSetup(): React.ReactElement {
  const [categoryName, setCategoryName] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Load cuisines and categories from API and build rows for each category-cuisine relation
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [rawCuisines, rawCategories] = await Promise.all([
          listCuisines(),
          listCategories(),
        ]);

        if (!mounted) return;

        // Normalize cuisines into a map id -> name
        const cuisineArray = Array.isArray(rawCuisines)
          ? rawCuisines
          : Array.isArray((rawCuisines as any)?.results)
          ? (rawCuisines as any).results
          : [];

        const cuisineMap = new Map<number | string, string>();
        cuisineArray.forEach((c: any, idx: number) => {
          const id =
            (typeof c.id === "number" ? c.id : Number(c.id)) ||
            (typeof c._id === "number" ? c._id : Number(c._id)) ||
            idx + 1;
          const name =
            typeof c.name === "string"
              ? c.name
              : typeof c.cuisine_name === "string"
              ? c.cuisine_name
              : typeof c.master_cuisine_name === "string"
              ? c.master_cuisine_name
              : typeof c.master_cuisine === "string"
              ? c.master_cuisine
              : "";
          cuisineMap.set(id, name);
        });

        // Normalize categories
        const categoryArray = Array.isArray(rawCategories)
          ? rawCategories
          : Array.isArray((rawCategories as any)?.results)
          ? (rawCategories as any).results
          : [];

        // Build one row per category-cuisine relation. If category has multiple cuisines, create multiple rows.
        const rows: SubCategory[] = [];
        categoryArray.forEach((cat: any) => {
          const catId = cat?.id ?? cat?.pk ?? Math.random();
          const catName =
            typeof cat.name === "string"
              ? cat.name
              : typeof cat.title === "string"
              ? cat.title
              : typeof cat.category === "string"
              ? cat.category
              : "";

          // Try different shapes for cuisines field
          let cuisineIds: Array<number | string> = [];
          if (Array.isArray(cat.cuisines)) {
            cuisineIds = cat.cuisines.map((c: any) =>
              typeof c === "object" ? c.id ?? c.pk ?? c : c
            );
          } else if (Array.isArray(cat.master_cuisines)) {
            cuisineIds = cat.master_cuisines.map((c: any) =>
              typeof c === "object" ? c.id ?? c.pk ?? c : c
            );
          } else if (cat.cuisine || cat.cuisine_id || cat.master_cuisine) {
            const single = cat.cuisine ?? cat.cuisine_id ?? cat.master_cuisine;
            cuisineIds = [single];
          }

          if (cuisineIds.length === 0) {
            // No cuisine relation, still show the category with empty cuisine
            rows.push({ id: catId, categoryName: catName, cuisineName: "-" });
          } else {
            cuisineIds.forEach((cid) => {
              const name = cuisineMap.get(cid) ?? String(cid ?? "-");
              rows.push({
                id: `${catId}-${cid}`,
                categoryName: catName,
                cuisineName: name,
              });
            });
          }
        });

        setSubCategories(rows);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load data");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleAdd = () => {
    if (!categoryName.trim() || !subCategoryName.trim()) return;
    const newSubCategory: SubCategory = {
      id: Date.now(),
      categoryName: categoryName.trim(),
      cuisineName: subCategoryName.trim(),
    };
    setSubCategories((prev) => [...prev, newSubCategory]);
    setCategoryName("");
    setSubCategoryName("");
  };

  const handleEdit = (id: number | string) => {
    console.log("Edit sub category:", id);
    // TODO: Implement edit functionality
  };

  const handleDelete = (id: number | string) => {
    setSubCategories((prev) => prev.filter((item) => item?.id !== id));
  };

  // ✅ Crash-proof filter
  const filteredSubCategories = (subCategories || []).filter((item) => {
    if (!item) return false;
    const q = searchTerm.toLowerCase();
    const category =
      typeof item.categoryName === "string" ? item.categoryName : "";
    const subCat = typeof item.cuisineName === "string" ? item.cuisineName : "";
    return (
      category.toLowerCase().includes(q) || subCat.toLowerCase().includes(q)
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
            placeholder="Search..."
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
            style={{ height: "38px", width: "140px" }}
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter Cuisine Name"
            className="form-input"
            style={{ height: "38px", width: "160px" }}
            value={subCategoryName}
            onChange={(e) => setSubCategoryName(e.target.value)}
          />
        </div>

        <div className="pagination-info">
          {loading
            ? "Loading..."
            : error
            ? "Error"
            : `${subCategories.length} record${
                subCategories.length === 1 ? "" : "s"
              }`}
        </div>

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
              <th>Cuisine Name</th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td colSpan={4} style={{ color: "#b00020", padding: 20 }}>
                  {error}
                </td>
              </tr>
            ) : loading ? (
              <tr>
                <td colSpan={4} style={{ padding: 20 }}>
                  Loading...
                </td>
              </tr>
            ) : filteredSubCategories.length === 0 ? (
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
                  <td>{item.categoryName || "-"}</td>
                  <td>{item.cuisineName || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
