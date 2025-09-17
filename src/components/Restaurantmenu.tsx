import React, { useEffect, useState } from "react";
import {
  listItems,
  createItem,
  listMasterCuisines,
  listCuisines,
  patchItem,
} from "../api/endpoints";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showRawColumn, setShowRawColumn] = useState(false);
  const [cuisineMap, setCuisineMap] = useState<Map<number, string>>(new Map());

  // Load cuisines for lookup
  useEffect(() => {
    const loadCuisines = async () => {
      try {
        // Try master cuisines first, then regular cuisines
        let cuisines = await listMasterCuisines();
        if (!Array.isArray(cuisines) || cuisines.length === 0) {
          cuisines = await listCuisines();
        }

        const map = new Map<number, string>();
        if (Array.isArray(cuisines)) {
          cuisines.forEach((c: any) => {
            const id = c.id ?? c.pk ?? c.cuisine_id;
            const name = c.name ?? c.title ?? c.cuisine_name ?? String(c);
            if (id && name) map.set(Number(id), String(name));
          });
        }
        setCuisineMap(map);
      } catch (e) {
        console.debug("Failed to load cuisines for lookup", e);
      }
    };
    loadCuisines();
  }, []);

  // Sample data - replace with actual API calls
  useEffect(() => {
    // Only load items after cuisines are loaded
    if (cuisineMap.size === 0) return;

    // Load items from backend
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listItems();
        console.debug("listItems raw response", data);
        setRawResponse(data);
        // normalize each item into our UI shape so table columns render reliably
        const normalized: MenuItem[] = (Array.isArray(data) ? data : []).map(
          (it: any) => ({
            id: it.id ?? it.pk ?? it.item_id ?? Date.now(),
            products:
              it.products ??
              it.item_name ??
              it.name ??
              it.title ??
              it.product ??
              "",
            masterPrice: Number(
              it.master_price ?? it.masterPrice ?? it.price ?? 0
            ),
            displayPrice: Number(
              it.display_price ?? it.displayPrice ?? it.price ?? 0
            ),
            category:
              (typeof it.category === "string" && it.category) ||
              (it.category && (it.category.name || it.category.title)) ||
              it.category_name ||
              "",
            // map cuisine from database cuisine field, lookup name if ID
            subCategory: (() => {
              const cuisineId =
                it.cuisine ?? it.cuisine_id ?? it.master_cuisine;
              if (cuisineId && cuisineMap.has(Number(cuisineId))) {
                return cuisineMap.get(Number(cuisineId)) || "";
              }
              return (
                it.cuisine_name ??
                (it.cuisine && (it.cuisine.name || it.cuisine.title)) ??
                it.master_cuisine_name ??
                it.sub_category ??
                it.subCategory ??
                it.sub_category_name ??
                ""
              );
            })(),
            // normalize menu type from item_type field
            menuType:
              it.item_type ??
              it.menu_type ??
              (it.menu_type &&
                typeof it.menu_type === "object" &&
                (it.menu_type.name || it.menu_type.title)) ??
              it.menu_type_name ??
              it.menuType ??
              it.menuTypeName ??
              "",
            discount: Number(it.discount ?? 0),
            createdOn: it.created_on ?? it.createdAt ?? it.created_at ?? "",
            updatedOn: it.updated_on ?? it.updatedAt ?? it.updated_at ?? "",
            status: (it.status ??
              (it.is_active ? "active" : undefined) ??
              "inactive") as "active" | "inactive",
          })
        );
        setMenuItems(normalized);
      } catch (e: any) {
        console.error("Failed to load items", e);
        setMenuItems([]);
        setError((e && e.toString()) || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [cuisineMap]);

  const handleAdd = () => {
    if (categoryName.trim() && timings.trim()) {
      const payload: any = {
        products: categoryName.trim(),
        menu_type: timings.trim(),
        // add minimal required fields — backend may require more
      };
      (async () => {
        try {
          const created = await createItem(payload);
          // Try to normalize created item to MenuItem shape where possible
          const item: MenuItem = {
            id: created.id ?? Date.now(),
            products: created.products ?? created.name ?? categoryName.trim(),
            masterPrice: created.master_price ?? created.masterPrice ?? 0,
            displayPrice: created.display_price ?? created.displayPrice ?? 0,
            category: created.category ?? "",
            subCategory: created.sub_category ?? created.subCategory ?? "",
            menuType: created.menu_type ?? created.menuType ?? timings.trim(),
            discount: created.discount ?? 0,
            createdOn: created.created_on ?? new Date().toLocaleDateString(),
            updatedOn: created.updated_on ?? new Date().toLocaleDateString(),
            status: created.status ?? "active",
          };
          setMenuItems((prev) => [...prev, item]);
          setCategoryName("");
          setTimings("");
        } catch (err) {
          console.error("Failed to create item", err);
        }
      })();
    }
  };

  // ...existing code...

  const handleDelete = (id: number) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Inline edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Partial<MenuItem>>({});

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setEditValues({
      products: item.products,
      masterPrice: item.masterPrice,
      displayPrice: item.displayPrice,
      category: item.category,
      subCategory: item.subCategory,
      menuType: item.menuType,
      discount: item.discount,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const saveEdit = async (id: number) => {
    const payload: any = {};
    if (editValues.products !== undefined)
      payload.products = editValues.products;
    if (editValues.masterPrice !== undefined)
      payload.master_price = Number(editValues.masterPrice);
    if (editValues.displayPrice !== undefined)
      payload.display_price = Number(editValues.displayPrice);
    if (editValues.category !== undefined)
      payload.category = editValues.category;
    if (editValues.subCategory !== undefined)
      payload.cuisine_name = editValues.subCategory; // best-effort
    if (editValues.menuType !== undefined)
      payload.menu_type = editValues.menuType;
    if (editValues.discount !== undefined)
      payload.discount = Number(editValues.discount);

    // optimistic update: apply edits locally first so UI updates immediately
    const prevMenu = menuItems;
    setMenuItems((prev) =>
      prev.map((m) =>
        m.id === id
          ? ({
              ...m,
              products: editValues.products ?? m.products,
              masterPrice: Number(editValues.masterPrice ?? m.masterPrice),
              displayPrice: Number(editValues.displayPrice ?? m.displayPrice),
              category: editValues.category ?? m.category,
              subCategory: editValues.subCategory ?? m.subCategory,
              menuType: editValues.menuType ?? m.menuType,
              discount: Number(editValues.discount ?? m.discount),
            } as MenuItem)
          : m
      )
    );

    try {
      console.debug("Saving item", id, payload);
      // include both display_price and price to maximize backend compatibility
      if (payload.display_price !== undefined && payload.price === undefined) {
        payload.price = payload.display_price;
      }
      const res: any = await patchItem(id, payload);
      console.debug("Save response", res);
      // merge server response if provided
      if (res) {
        setMenuItems((prev) =>
          prev.map((m) =>
            m.id === id
              ? ({
                  ...m,
                  ...{
                    products: res.products ?? res.name ?? m.products,
                    masterPrice: Number(
                      res.master_price ?? res.masterPrice ?? m.masterPrice
                    ),
                    displayPrice: Number(
                      res.display_price ??
                        res.displayPrice ??
                        res.price ??
                        m.displayPrice
                    ),
                    category: res.category ?? res.category_name ?? m.category,
                    subCategory:
                      res.cuisine_name ??
                      res.cuisine ??
                      res.master_cuisine_name ??
                      m.subCategory,
                    menuType: res.menu_type ?? res.item_type ?? m.menuType,
                    discount: Number(res.discount ?? m.discount),
                  },
                } as MenuItem)
              : m
          )
        );
      }
      setEditingId(null);
      setEditValues({});
    } catch (err) {
      console.error("Failed to save edits", err);
      // rollback optimistic update
      setMenuItems(prevMenu);
    }
  };

  // Toggle status active <-> inactive (optimistic UI with rollback on error)
  const handleToggleStatus = async (id: number) => {
    const prev = menuItems;
    const next = menuItems.map((m) =>
      m.id === id
        ? ({
            ...m,
            status: m.status === "active" ? "inactive" : "active",
          } as MenuItem)
        : m
    );
    setMenuItems(next);
    try {
      const item = next.find((m) => m.id === id);
      if (!item) return;
      // backend may expect boolean like `is_active` or `status` string — try both
      await patchItem(id, {
        status: item.status,
        is_active: item.status === "active",
      });
    } catch (err) {
      console.error("Failed to update item status", err);
      // rollback
      setMenuItems(prev);
    }
  };

  const filteredMenuItems = menuItems.filter((item) => {
    const term = searchTerm.toLowerCase();
    const prod = (item.products || "").toString().toLowerCase();
    const cat = (item.category || "").toString().toLowerCase();
    const sub = (item.subCategory || "").toString().toLowerCase();
    return prod.includes(term) || cat.includes(term) || sub.includes(term);
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

  // Format ISO/date-like strings to `YYYY-MM-DD HH:MM:SS` (local time)
  const formatDateTime = (val: string) => {
    if (!val) return "";
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return String(val);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const min = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    } catch (e) {
      return String(val);
    }
  };

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
        <button
          className="add-btn"
          onClick={() => document.getElementById("menu-import-input")?.click()}
          type="button"
        >
          Import
        </button>
        <input
          id="menu-import-input"
          type="file"
          accept=".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
              const text = evt.target?.result as string;
              console.log("Imported file content length:", text?.length || 0);
              // TODO: parse and update menuItems
            };
            reader.readAsText(file);
            e.target.value = ""; // reset
          }}
        />

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
              <th>Cuisine</th>
              <th>Menu Type</th>
              <th>Discount</th>
              <th>Created On</th>
              <th>Updated On</th>
              <th>Status</th>
              {showRawColumn && <th>Raw</th>}
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
                      {editingId === item.id ? (
                        <>
                          <button
                            className="action-btn edit-btn"
                            title="Save"
                            onClick={() => saveEdit(item.id)}
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
                            onClick={() => startEdit(item)}
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
                        </>
                      )}
                    </div>
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <input
                        value={String(editValues.products ?? "")}
                        onChange={(e) =>
                          setEditValues((s) => ({
                            ...s,
                            products: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      item.products
                    )}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <input
                        type="number"
                        value={String(
                          editValues.masterPrice ?? item.masterPrice
                        )}
                        onChange={(e) =>
                          setEditValues((s) => ({
                            ...s,
                            masterPrice: Number(e.target.value),
                          }))
                        }
                      />
                    ) : (
                      `₹${item.masterPrice}`
                    )}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <input
                        type="number"
                        value={String(
                          editValues.displayPrice ?? item.displayPrice
                        )}
                        onChange={(e) =>
                          setEditValues((s) => ({
                            ...s,
                            displayPrice: Number(e.target.value),
                          }))
                        }
                      />
                    ) : (
                      `₹${item.displayPrice}`
                    )}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <input
                        value={String(editValues.category ?? "")}
                        onChange={(e) =>
                          setEditValues((s) => ({
                            ...s,
                            category: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      item.category
                    )}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <input
                        value={String(editValues.subCategory ?? "")}
                        onChange={(e) =>
                          setEditValues((s) => ({
                            ...s,
                            subCategory: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      item.subCategory
                    )}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <input
                        value={String(editValues.menuType ?? "")}
                        onChange={(e) =>
                          setEditValues((s) => ({
                            ...s,
                            menuType: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      item.menuType
                    )}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <input
                        type="number"
                        value={String(editValues.discount ?? item.discount)}
                        onChange={(e) =>
                          setEditValues((s) => ({
                            ...s,
                            discount: Number(e.target.value),
                          }))
                        }
                      />
                    ) : (
                      `${item.discount}%`
                    )}
                  </td>
                  <td>{formatDateTime(item.createdOn)}</td>
                  <td>{formatDateTime(item.updatedOn)}</td>
                  <td>
                    <label
                      className="status-toggle"
                      title={
                        item.status === "active" ? "Deactivate" : "Activate"
                      }
                    >
                      <input
                        type="checkbox"
                        checked={item.status === "active"}
                        onChange={() => handleToggleStatus(item.id)}
                        aria-label={
                          item.status === "active" ? "Deactivate" : "Activate"
                        }
                      />
                      <span className="switch">
                        <span className="knob" />
                      </span>
                    </label>
                  </td>
                  {showRawColumn && (
                    <td
                      style={{
                        fontSize: 12,
                        whiteSpace: "pre-wrap",
                        maxWidth: 300,
                      }}
                    >
                      <pre style={{ margin: 0, fontSize: 11 }}>
                        {JSON.stringify(
                          (Array.isArray(rawResponse)
                            ? rawResponse.find(
                                (r: any) =>
                                  r.id === item.id ||
                                  r.pk === item.id ||
                                  r.item_id === item.id
                              )
                            : rawResponse) || {},
                          null,
                          2
                        )}
                      </pre>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
