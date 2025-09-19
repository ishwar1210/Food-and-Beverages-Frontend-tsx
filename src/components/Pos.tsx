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
  // Track selected order type so the clicked button remains active
  const [selectedOrderType, setSelectedOrderType] = useState<
    "dine" | "delivery" | "pickup"
  >("dine");
  // Search inputs state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCode, setSearchCode] = useState("");

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

  const removeCartItem = (itemId: number) => {
    setCartItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  // Other payment modal state
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [showOtherPaymentModal, setShowOtherPaymentModal] = useState(false);
  const [otherPaymentType, setOtherPaymentType] =
    useState<string>("Google Pay");
  const [otherPaymentNote, setOtherPaymentNote] = useState<string>("");

  // Discount as percentage (0-100)
  const [discountPct, setDiscountPct] = useState<number>(0);

  // Live current time for KOT display
  const [currentTime, setCurrentTime] = useState<string>(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  });

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      setCurrentTime(
        `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
      );
    };
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const getFinalTotal = () => {
    const subtotal = getTotalPrice();
    const pct =
      Number.isFinite(discountPct) && discountPct > 0 ? discountPct : 0;
    const discountAmount = (subtotal * pct) / 100;
    const final = subtotal - discountAmount;
    return final >= 0 ? final : 0;
  };

  const handleDiscountChange = (value: string) => {
    if (value === "") {
      setDiscountPct(0);
      return;
    }
    // sanitize input to number
    const num = parseFloat(value as any);
    if (isNaN(num) || num <= 0) {
      setDiscountPct(0);
      return;
    }
    const clamped = Math.min(Math.max(num, 0), 100);
    setDiscountPct(Number(clamped.toFixed(2)));
  };

  // Partition items into veg and non-veg lists using normalized itemType
  const vegItemsAll = items.filter((item) => item.itemType === "veg");
  const nonVegItemsAll = items.filter((item) => item.itemType === "non-veg");

  // Apply search filters (by name and by code). Code field may be item.code or item.sku
  const matchesSearch = (item: Item) => {
    const q = searchTerm.trim().toLowerCase();
    const codeQ = searchCode.trim().toLowerCase();
    const name = (item.name || "").toLowerCase();
    const code = ((item as any).code ?? (item as any).sku ?? "")
      .toString()
      .toLowerCase();
    if (q && !name.includes(q)) return false;
    if (codeQ && !code.includes(codeQ)) return false;
    return true;
  };

  const vegItems = vegItemsAll.filter(matchesSearch);
  const nonVegItems = nonVegItemsAll.filter(matchesSearch);

  return (
    <div className="pos-container">
      {/* Cuisine Navigation */}
      <Possubcategory onCuisineSelect={handleCuisineSelect} />

      <div className="pos-main-content">
        <div className="pos-content-wrapper">
          {/* Items Grid */}
          <div className="pos-items-section">
            {/* Moved search bar into items section (above category tabs) */}
            <div className="pos-search-section" style={{ padding: "8px 12px" }}>
              <div className="pos-search-bar" style={{ width: "100%" }}>
                <div className="pos-search-left">
                  <div className="pos-search-inputs">
                    <div className="pos-search-box">
                      <input
                        type="text"
                        placeholder="Search Item"
                        className="pos-search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="pos-search-box">
                      <input
                        type="text"
                        placeholder="Search Code"
                        className="pos-search-input"
                        value={searchCode}
                        onChange={(e) => setSearchCode(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
                    {vegItems.length === 0 ? (
                      <div className="pos-no-items">No veg items found</div>
                    ) : (
                      vegItems.map((item) => (
                        <div
                          key={`v-${item.id}`}
                          className={`pos-item-card ${
                            item.isVeg ? "veg" : "non-veg"
                          }`}
                          onClick={() => handleAddToCart(item)}
                        >
                          <div className="pos-item-name">{item.name}</div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="pos-items-column">
                    {nonVegItems.length === 0 ? (
                      <div className="pos-no-items">No non-veg items found</div>
                    ) : (
                      nonVegItems.map((item) => (
                        <div
                          key={`n-${item.id}`}
                          className={`pos-item-card ${
                            item.isVeg ? "veg" : "non-veg"
                          }`}
                          onClick={() => handleAddToCart(item)}
                        >
                          <div className="pos-item-name">{item.name}</div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Cart/Checkout Section */}
          <div className="pos-cart-section">
            {/* Order type buttons moved into cart area as requested */}
            <div
              className="pos-order-panel"
              style={{
                padding: "8px 12px",
                display: "flex",
                gap: 8,
                justifyContent: "center",
              }}
            >
              <button
                className={`pos-order-btn ${
                  selectedOrderType === "dine" ? "active" : ""
                }`}
                onClick={() => setSelectedOrderType("dine")}
                aria-pressed={selectedOrderType === "dine"}
              >
                Dine In
              </button>
              <button
                className={`pos-order-btn ${
                  selectedOrderType === "delivery" ? "active" : ""
                }`}
                onClick={() => setSelectedOrderType("delivery")}
                aria-pressed={selectedOrderType === "delivery"}
              >
                Delivery
              </button>
              <button
                className={`pos-order-btn ${
                  selectedOrderType === "pickup" ? "active" : ""
                }`}
                onClick={() => setSelectedOrderType("pickup")}
                aria-pressed={selectedOrderType === "pickup"}
              >
                Pick Up
              </button>
            </div>

            <div className="pos-cart-header">
              <span></span>
              <span>Items</span>
              <span style={{ textAlign: "center" }}>Qty</span>
              <span style={{ textAlign: "right" }}>Price</span>
            </div>

            <div className="pos-cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="pos-cart-item">
                  <button
                    className="pos-cart-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCartItem(item.id);
                    }}
                    aria-label="Remove item"
                    title="Remove item"
                  >
                    {/* DeleteIcon copied from Addrestaurant.tsx for exact visual parity */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="3,6 5,6 21,6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </button>
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
                <div className="pos-table-info">
                  KOT - 10 Time - {currentTime}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, color: "#666" }}>
                    Subtotal: {getTotalPrice().toFixed(2)}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      justifyContent: "flex-end",
                      marginTop: 6,
                    }}
                  >
                    <label style={{ fontSize: 13, color: "#333" }}>
                      Discount:
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.1"
                      value={discountPct === 0 ? "" : String(discountPct)}
                      onChange={(e) => handleDiscountChange(e.target.value)}
                      onFocus={(e) => {
                        // remove leading 0 placeholder when user focuses
                        if ((e.target as HTMLInputElement).value === "0")
                          (e.target as HTMLInputElement).value = "";
                      }}
                      onBlur={(e) => {
                        // ensure discount is clamped and shown as number on blur
                        const val = (e.target as HTMLInputElement).value;
                        handleDiscountChange(val);
                      }}
                      className="pos-discount-input"
                    />
                  </div>
                  <div className="pos-total-amount" style={{ marginTop: 8 }}>
                    Total: {getFinalTotal().toFixed(2)}
                  </div>
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
                  <input
                    type="radio"
                    name="payment"
                    onChange={() => setShowOtherPaymentModal(true)}
                  />{" "}
                  Other
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
      {showOtherPaymentModal && (
        <div className="other-payment-modal">
          <div className="other-payment-panel">
            <div className="other-payment-header">
              <span>Other Payment Type</span>
              <button
                className="close-btn"
                onClick={() => setShowOtherPaymentModal(false)}
              >
                ×
              </button>
            </div>

            <div className="other-payment-body">
              <label>Other Payment Type</label>
              <select
                value={otherPaymentType}
                onChange={(e) => setOtherPaymentType(e.target.value)}
              >
                <option>Google Pay</option>
                <option>PhonePe</option>
                <option>Paytm</option>
                <option>Amazon Pay</option>
                <option>Cash App</option>
              </select>

              <textarea
                placeholder="Notes"
                value={otherPaymentNote}
                onChange={(e) => setOtherPaymentNote(e.target.value)}
              />
            </div>

            <div className="other-payment-footer">
              <button
                className="pos-action-btn"
                onClick={() => setShowOtherPaymentModal(false)}
              >
                Cancel
              </button>
              <button
                className="pos-action-btn"
                onClick={() => {
                  // For now, just close and log — backend integration can be added later
                  console.log(
                    "Selected other payment:",
                    otherPaymentType,
                    otherPaymentNote
                  );
                  setShowOtherPaymentModal(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
