import React, { useState, useEffect } from "react";
import Possubcategory from "./Possubcategory";
import "./Pos.css";
import { listItems } from "../api/endpoints";

interface Cuisine {
  id: number;
  name: string;
}

interface Item {
  id: number;
  name: string;
  price: number;
  category: string;
  isVeg: boolean;
  item_type?: string | number | null;
  itemType?: "veg" | "non-veg" | null;
}

export default function Pos(): React.ReactElement {
  const [selectedCuisine, setSelectedCuisine] = useState<Cuisine | null>(null);
  const [cartItems, setCartItems] = useState<
    Array<Item & { quantity: number }>
  >([]);
  // We show Veg and Non-Veg in two columns (partitioned)
  const [items, setItems] = useState<Item[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);

  const handleCuisineSelect = (cuisine: Cuisine | null) => {
    setSelectedCuisine(cuisine);
    console.log("Selected cuisine:", cuisine);
  };

  // Fetch items for the selected cuisine
  useEffect(() => {
    let mounted = true;
    const loadItems = async () => {
      if (!selectedCuisine) {
        setItems([]);
        return;
      }
      setItemsLoading(true);
      setItemsError(null);
      try {
        // Try to query items by cuisine id. Backend may accept 'cuisine' or 'cuisine_id'.
        const params = { cuisine: selectedCuisine.id } as any;
        let data = await listItems(params);

        // normalize list response
        const arr = Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.results)
          ? (data as any).results
          : [];

        const normalized: Item[] = arr.map((it: any, idx: number) => {
          const rawType = it.item_type ?? it.type ?? null;
          let normType: "veg" | "non-veg" | null = null;
          if (rawType != null) {
            if (typeof rawType === "string") {
              const lower = rawType.toLowerCase();
              if (
                lower.includes("non") ||
                lower.includes("non-veg") ||
                lower.includes("non veg") ||
                lower.includes("nonveg")
              ) {
                normType = "non-veg";
              } else if (lower.includes("veg") || lower === "v") {
                normType = "veg";
              }
            } else if (typeof rawType === "number") {
              normType =
                rawType === 1 ? "veg" : rawType === 0 ? "non-veg" : null;
            }
          }

          const isVegStrict = normType === "veg";

          return {
            id: (typeof it.id === "number" ? it.id : Number(it.id)) || idx + 1,
            name:
              typeof it.name === "string"
                ? it.name
                : typeof it.title === "string"
                ? it.title
                : typeof it.item_name === "string"
                ? it.item_name
                : "",
            price: Number(it.price ?? it.selling_price ?? it.cost ?? 0) || 0,
            category:
              typeof it.category === "string"
                ? it.category
                : typeof it.category_name === "string"
                ? it.category_name
                : typeof it.group === "string"
                ? it.group
                : "",
            item_type: it.item_type ?? it.type ?? null,
            itemType: normType,
            isVeg: isVegStrict,
          } as Item;
        });

        if (!mounted) return;
        setItems(normalized);
      } catch (e: any) {
        if (mounted) setItemsError(e?.message || "Failed to load items");
      } finally {
        if (mounted) setItemsLoading(false);
      }
    };

    loadItems();
    return () => {
      mounted = false;
    };
  }, [selectedCuisine]);

  const handleAddToCart = (item: Item) => {
    setCartItems((prev) => {
      const existingItem = prev.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  // Partition items into veg and non-veg lists using normalized itemType
  const vegItems = items.filter((item) => item.itemType === "veg");
  const nonVegItems = items.filter((item) => item.itemType === "non-veg");

  return (
    <div className="pos-container">
      {/* Cuisine Navigation */}
      <Possubcategory onCuisineSelect={handleCuisineSelect} />

      <div className="pos-main-content">
        {/* Search Section */}
        <div className="pos-search-section">
          <div className="pos-search-bar">
            <div className="pos-search-inputs">
              <div className="pos-search-box">
                <input
                  type="text"
                  placeholder="Search Item"
                  className="pos-search-input"
                />
              </div>
              <div className="pos-search-box">
                <input
                  type="text"
                  placeholder="Search Code"
                  className="pos-search-input"
                />
              </div>
            </div>

            <div className="pos-order-type">
              <button className="pos-order-btn active">Dine In</button>
              <button className="pos-order-btn">Delivery</button>
              <button className="pos-order-btn">Pick Up</button>
            </div>
          </div>
        </div>

        <div className="pos-content-wrapper">
          {/* Items Grid */}
          <div className="pos-items-section">
            <div className="pos-category-tabs" style={{ padding: "8px 12px" }}>
              <div className="pos-category-tab">Veg</div>
              <div className="pos-category-tab">Non Veg</div>
            </div>

            <div className="pos-items-grid">
              {itemsLoading ? (
                <div className="pos-item-card">Loading items...</div>
              ) : itemsError ? (
                <div className="pos-item-card">Error: {itemsError}</div>
              ) : items.length === 0 ? (
                <div className="pos-item-card">No items found</div>
              ) : (
                <>
                  <div className="pos-items-column">
                    {vegItems.map((item) => (
                      <div
                        key={`v-${item.id}`}
                        className={`pos-item-card ${
                          item.isVeg ? "veg" : "non-veg"
                        }`}
                        onClick={() => handleAddToCart(item)}
                      >
                        <div className="pos-item-name">{item.name}</div>
                      </div>
                    ))}
                  </div>
                  <div className="pos-items-column">
                    {nonVegItems.map((item) => (
                      <div
                        key={`n-${item.id}`}
                        className={`pos-item-card ${
                          item.isVeg ? "veg" : "non-veg"
                        }`}
                        onClick={() => handleAddToCart(item)}
                      >
                        <div className="pos-item-name">{item.name}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Cart/Checkout Section */}
          <div className="pos-cart-section">
            <div className="pos-cart-header">
              <span></span>
              <span>Items</span>
              <span style={{ textAlign: "center" }}>Qty</span>
              <span style={{ textAlign: "right" }}>Price</span>
            </div>

            <div className="pos-cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="pos-cart-item">
                  <div
                    className={`pos-cart-indicator ${
                      item.isVeg ? "veg" : "non-veg"
                    }`}
                  ></div>
                  <div className="pos-cart-item-name">{item.name}</div>
                  <div className="pos-cart-controls">
                    <button
                      className="pos-qty-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(item.id, item.quantity + 1);
                      }}
                    >
                      +
                    </button>
                    <span className="pos-qty">{item.quantity}</span>
                    <button
                      className="pos-qty-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(item.id, item.quantity - 1);
                      }}
                    >
                      -
                    </button>
                  </div>
                  <div className="pos-cart-price">
                    {(item.price * item.quantity).toFixed(1)}
                  </div>
                </div>
              ))}
            </div>

            <div className="pos-cart-footer">
              <div className="pos-total">
                <div className="pos-table-info">KOT- 10 Time - 0:330</div>
                <div className="pos-total-amount">
                  Total: {getTotalPrice().toFixed(1)}
                </div>
              </div>

              <div className="pos-payment-options">
                <label>
                  <input type="radio" name="payment" defaultChecked /> Cash
                </label>
                <label>
                  <input type="radio" name="payment" /> Due
                </label>
                <label>
                  <input type="radio" name="payment" /> Card
                </label>
                <label>
                  <input type="radio" name="payment" /> Part Payment
                </label>
                <label>
                  <input type="radio" name="payment" /> Other
                </label>
              </div>

              <div className="pos-additional-options">
                <label>
                  <input type="checkbox" /> It's Paid
                </label>
                <label>
                  <input type="checkbox" /> Loyalty
                </label>
                <label>
                  <input type="checkbox" /> Send Feedback SMS
                </label>
              </div>

              <div className="pos-action-buttons">
                <button className="pos-action-btn">Save</button>
                <button className="pos-action-btn">Save & Print</button>
                <button className="pos-action-btn">Save & e-bill</button>
                <button className="pos-action-btn">KOT</button>
                <button className="pos-action-btn">KOT & Print</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
