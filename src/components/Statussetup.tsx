import React, { useEffect, useState, useRef } from "react";
import "./Statussetup.css";

interface StatusItem {
  id: number;
  orderID: string;
  status: string;
  fixedDisplay: string;
  fixedStatus: string;
  mail: boolean;
  sms: boolean;
  canCancel: boolean;
  color: string;
}

export default function StatusSetup(): React.ReactElement {
  const [statusText, setStatusText] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [fixedState, setFixedState] = useState("");
  const [orderValue, setOrderValue] = useState("");
  const [selectedColor, setSelectedColor] = useState("#dc3545");
  // Predefined colors for the common fixed states
  const statusColorMap: Record<string, string> = {
    Pending: "#ffc107",
    Confirmed: "#17a2b8",
    Processing: "#6f42c1",
    Completed: "#28a745",
    Cancelled: "#dc3545",
  };
  const [statusItems, setStatusItems] = useState<StatusItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Sample data - replace with actual API calls
  useEffect(() => {
    // This would be replaced with actual API call
    setStatusItems([
      // Add sample data here if needed
    ]);
  }, []);

  // When user selects a fixed state, pick the corresponding predefined color
  useEffect(() => {
    if (fixedState && statusColorMap[fixedState]) {
      setSelectedColor(statusColorMap[fixedState]);
    }
  }, [fixedState]);

  // close color dropdown on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!dropdownRef.current) return;
      if (e.target instanceof Node && !dropdownRef.current.contains(e.target)) {
        setColorDropdownOpen(false);
      }
    }

    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const handleAdd = () => {
    if (
      statusText.trim() &&
      displayName.trim() &&
      fixedState.trim() &&
      orderValue.trim()
    ) {
      const newStatusItem: StatusItem = {
        id: Date.now(),
        orderID: `ORD${Math.floor(Math.random() * 10000)}`,
        status: statusText.trim(),
        fixedDisplay: displayName.trim(),
        fixedStatus: fixedState.trim(),
        mail: false,
        sms: false,
        canCancel: false,
        color: selectedColor,
      };

      setStatusItems((prev) => [...prev, newStatusItem]);
      setStatusText("");
      setDisplayName("");
      setFixedState("");
      setOrderValue("");
      setSelectedColor("#dc3545");
    }
  };

  const handleEdit = (id: number) => {
    console.log("Edit status item:", id);
    // Implement edit functionality
  };

  const handleDelete = (id: number) => {
    setStatusItems((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredStatusItems = statusItems.filter(
    (item) =>
      item.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fixedDisplay.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.orderID.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="status-setup-container" style={{ paddingLeft: "40px" }}>
      <div className="status-setup-header">
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
            placeholder="Enter Status"
            className="form-input"
            value={statusText}
            onChange={(e) => setStatusText(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter Display Name"
            className="form-input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <select
            className="form-select"
            value={fixedState}
            onChange={(e) => setFixedState(e.target.value)}
          >
            <option value="">Select Fixed State</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <div
            className="color-picker-container"
            style={{ alignItems: "center" }}
          >
            <div ref={dropdownRef} style={{ position: "relative" }}>
              <button
                type="button"
                className="color-toggle"
                onClick={() => setColorDropdownOpen((v) => !v)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 8px",
                  border: "1px solid #ddd",
                  background: "#fff",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    width: 20,
                    height: 16,
                    backgroundColor: selectedColor,
                    display: "inline-block",
                    borderRadius: 3,
                    border: "1px solid #ccc",
                  }}
                />
                <span style={{ fontSize: 13 }}>
                  {Object.keys(statusColorMap).find(
                    (k) => statusColorMap[k] === selectedColor
                  ) || "Custom"}
                </span>
                <span style={{ marginLeft: 8 }}>▾</span>
              </button>

              {colorDropdownOpen && (
                <div
                  className="color-options"
                  style={{
                    position: "absolute",
                    zIndex: 10,
                    top: "100%",
                    left: 0,
                    background: "#fff",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    padding: 8,
                    borderRadius: 6,
                    marginTop: 6,
                    minWidth: 180,
                  }}
                >
                  {Object.entries(statusColorMap).map(([key, color]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setSelectedColor(color);
                        setColorDropdownOpen(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 8px",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "left",
                      }}
                    >
                      <span
                        style={{
                          width: 18,
                          height: 14,
                          backgroundColor: color,
                          display: "inline-block",
                          borderRadius: 3,
                          border: "1px solid #ccc",
                        }}
                      />
                      <span>{key}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <input
            type="text"
            placeholder="Enter Order"
            className="form-input"
            value={orderValue}
            onChange={(e) => setOrderValue(e.target.value)}
          />
        </div>

        <div className="pagination-info">1-1 of 1</div>

        <div className="pagination-controls">
          <button className="pagination-btn">‹</button>
          <button className="pagination-btn">›</button>
        </div>
      </div>

      <div className="status-setup-table-container">
        <table className="status-setup-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Order ID</th>
              <th>Status</th>
              <th>Fixed Display</th>
              <th>Fixed Status</th>
              <th>Mail</th>
              <th>SMS</th>
              <th>Can Cancel</th>
              <th>Color</th>
            </tr>
          </thead>
          <tbody>
            {filteredStatusItems.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  style={{ textAlign: "center", padding: "40px" }}
                >
                  No status items found
                </td>
              </tr>
            ) : (
              filteredStatusItems.map((item) => (
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
                  <td>{item.orderID}</td>
                  <td>{item.status}</td>
                  <td>{item.fixedDisplay}</td>
                  <td>{item.fixedStatus}</td>
                  <td>
                    <span className={`boolean-display ${item.mail}`}>
                      {item.mail ? "Yes" : "No"}
                    </span>
                  </td>
                  <td>
                    <span className={`boolean-display ${item.sms}`}>
                      {item.sms ? "Yes" : "No"}
                    </span>
                  </td>
                  <td>
                    <span className={`boolean-display ${item.canCancel}`}>
                      {item.canCancel ? "Yes" : "No"}
                    </span>
                  </td>
                  <td>
                    <div
                      className="color-display"
                      style={{ backgroundColor: item.color }}
                    ></div>
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
