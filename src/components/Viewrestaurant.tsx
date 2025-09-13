import { useEffect, useState } from "react";
import {
  retrieveRestaurant,
  listTableBookings,
  listGalleryImages,
  listMenuImages,
  listRestaurantSchedules,
  updateRestaurantSchedule,
} from "../api/endpoints";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlassPlus } from "@fortawesome/free-solid-svg-icons";

interface Props {
  id: number;
  onBack: () => void;
}

interface Restaurant {
  id: number;
  restaurant_name?: string;
  name?: string;
  address?: string;
  number?: string;
  cost_for_two?: number;
  delivery_time?: string;
  terms_and_conditions?: string;
  closing_message?: string;
}

interface TableBooking {
  no_of_tables?: number;
  min_people?: number;
  max_people?: number;
  can_cancel_before?: string;
  booking_not_available_text?: string;
}

interface GalleryImage {
  id: number;
  image?: string;
  url?: string;
}

interface MenuImage {
  id: number;
  image?: string;
  url?: string;
}

interface RestaurantSchedule {
  id: number;
  day_display?: string;
  start_time?: string;
  end_time?: string;
  break_start_time?: string;
  break_end_time?: string;
  booking_allowed?: boolean;
  order_allowed?: boolean;
  last_order_time?: string;
}

export default function Viewrestaurant({ id, onBack }: Props) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [tableBooking, setTableBooking] = useState<TableBooking | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [menuImages, setMenuImages] = useState<MenuImage[]>([]);
  const [restaurantSchedules, setRestaurantSchedules] = useState<
    RestaurantSchedule[]
  >([]);
  const [isScheduleExpanded, setIsScheduleExpanded] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(
    null
  );
  const [savingScheduleId, setSavingScheduleId] = useState<number | null>(null);
  const [scheduleDraft, setScheduleDraft] = useState<
    Partial<RestaurantSchedule>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMenuImage, setSelectedMenuImage] = useState<MenuImage | null>(
    null
  );

  useEffect(() => {
    const load = async () => {
      try {
        const restaurantData = await retrieveRestaurant(id);
        setRestaurant(restaurantData);
        const tb = await listTableBookings({ restaurant: id });
        setTableBooking(tb[0] || null);
        const gallery = await listGalleryImages({ restaurant: id });
        setGalleryImages(Array.isArray(gallery) ? gallery : []);
        const menu = await listMenuImages({ restaurant: id });
        setMenuImages(Array.isArray(menu) ? menu : []);
      } catch (e: any) {
        setError("Failed to load");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleScheduleClick = async () => {
    if (!isScheduleExpanded) {
      try {
        const scheduleData = await listRestaurantSchedules({ restaurant: id });
        console.log("Restaurant Schedules API Response:", scheduleData);
        setRestaurantSchedules(Array.isArray(scheduleData) ? scheduleData : []);
      } catch (e: any) {
        console.error("Failed to load restaurant schedules:", e);
      }
    }
    setIsScheduleExpanded(!isScheduleExpanded);
  };

  const startEditing = (scheduleItem: RestaurantSchedule) => {
    setEditingScheduleId(scheduleItem.id);
    setScheduleDraft({ ...scheduleItem });
  };

  const cancelEditing = () => {
    setEditingScheduleId(null);
    setScheduleDraft({});
  };

  const handleDraftChange = (
    field: keyof RestaurantSchedule,
    value: string | boolean
  ) => {
    setScheduleDraft((prev) => ({ ...prev, [field]: value }));
  };

  const saveSchedule = async (scheduleItem: RestaurantSchedule) => {
    if (!editingScheduleId) return;
    setSavingScheduleId(editingScheduleId);
    try {
      // Build payload only with editable fields
      const payload: any = {
        start_time: scheduleDraft.start_time ?? scheduleItem.start_time,
        end_time: scheduleDraft.end_time ?? scheduleItem.end_time,
        break_start_time:
          scheduleDraft.break_start_time ?? scheduleItem.break_start_time,
        break_end_time:
          scheduleDraft.break_end_time ?? scheduleItem.break_end_time,
        booking_allowed:
          scheduleDraft.booking_allowed ?? scheduleItem.booking_allowed,
        order_allowed:
          scheduleDraft.order_allowed ?? scheduleItem.order_allowed,
        last_order_time:
          scheduleDraft.last_order_time ?? scheduleItem.last_order_time,
      };
      await updateRestaurantSchedule(editingScheduleId, payload);
      // Update local list
      setRestaurantSchedules((prev) =>
        prev.map((s) => (s.id === editingScheduleId ? { ...s, ...payload } : s))
      );
      cancelEditing();
    } catch (e) {
      console.error("Save failed", e);
      alert("Failed to save schedule");
    } finally {
      setSavingScheduleId(null);
    }
  };

  if (loading) return <div style={{ padding: "40px" }}>Loading...</div>;
  if (error) return <div style={{ padding: "40px" }}>{error}</div>;
  if (!restaurant) return <div style={{ padding: "40px" }}>Not found</div>;

  const name = restaurant.restaurant_name || restaurant.name;

  return (
    <div style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <button
          onClick={onBack}
          style={{
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          Back to Restaurant List
        </button>
      </div>

      {/* Main Content */}
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
        }}
      >
        {/* Restaurant Info Row */}
        <div
          style={{
            display: "flex",
            gap: "40px",
            marginBottom: "30px",
            alignItems: "flex-start",
          }}
        >
          {/* Left: Restaurant Details */}
          <div style={{ flex: 2 }}>
            <h3
              style={{
                margin: "0 0 15px",
                fontSize: "18px",
                fontWeight: "600",
                color: "#333",
              }}
            >
              {name}
            </h3>
            <p
              style={{
                margin: "0 0 10px",
                color: "#666",
                fontSize: "14px",
              }}
            >
              {restaurant.address || "Juhu, Mumbai"}
            </p>

            {/* Delivery Time and Cost */}
            <div style={{ display: "flex", gap: "30px", marginTop: "15px" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span style={{ fontSize: "16px" }}>🕒</span>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "500" }}>
                    {restaurant.delivery_time || "50 Mins"}
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    Delivery Time
                  </div>
                </div>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span style={{ fontSize: "16px" }}>₹</span>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "500" }}>
                    ₹{restaurant.cost_for_two || 2000}
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    Cost for Two
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Gallery */}
          <div style={{ flex: 1 }}>
            <h4
              style={{
                margin: "0 0 12px",
                fontSize: "16px",
                fontWeight: "500",
              }}
            >
              Gallery
            </h4>
            <div style={{ display: "flex", gap: "10px" }}>
              {galleryImages.length > 0 ? (
                galleryImages.slice(0, 2).map((image, index) => (
                  <div
                    key={index}
                    style={{
                      width: "160px",
                      height: "120px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      overflow: "hidden",
                      backgroundColor: "#ddd",
                    }}
                  >
                    <img
                      src={image.image || image.url}
                      alt={`Gallery ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                ))
              ) : (
                <>
                  <div
                    style={{
                      width: "160px",
                      height: "120px",
                      backgroundColor: "#ddd",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                    }}
                  />
                  <div
                    style={{
                      width: "160px",
                      height: "120px",
                      backgroundColor: "#ddd",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Restaurant Schedule */}
        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={handleScheduleClick}
            style={{
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              padding: "8px 12px",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Restaurant Schedule {isScheduleExpanded ? "▲" : "▼"}
          </button>

          {/* Expanded Schedule Display */}
          {isScheduleExpanded && (
            <div
              style={{
                backgroundColor: "white",
                border: "1px solid #ddd",
                borderRadius: "4px",
                marginTop: "10px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "15px",
                  borderBottom: "1px solid #eee",
                  fontWeight: "500",
                  fontSize: "16px",
                  backgroundColor: "#f8f9fa",
                }}
              >
                Weekly Schedule
              </div>
              <div style={{ padding: "0" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8f9fa" }}>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontSize: "14px",
                          fontWeight: "500",
                          border: "1px solid #ddd",
                        }}
                      >
                        Operational Days
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontSize: "14px",
                          fontWeight: "500",
                          border: "1px solid #ddd",
                        }}
                      >
                        Start Time
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontSize: "14px",
                          fontWeight: "500",
                          border: "1px solid #ddd",
                        }}
                      >
                        End Time
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontSize: "14px",
                          fontWeight: "500",
                          border: "1px solid #ddd",
                        }}
                      >
                        Break Start Time
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontSize: "14px",
                          fontWeight: "500",
                          border: "1px solid #ddd",
                        }}
                      >
                        Break End Time
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontSize: "14px",
                          fontWeight: "500",
                          border: "1px solid #ddd",
                        }}
                      >
                        Booking Allowed
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontSize: "14px",
                          fontWeight: "500",
                          border: "1px solid #ddd",
                        }}
                      >
                        Order Allowed
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontSize: "14px",
                          fontWeight: "500",
                          border: "1px solid #ddd",
                        }}
                      >
                        Last Booking & Order Time
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          fontSize: "14px",
                          fontWeight: "500",
                          border: "1px solid #ddd",
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {restaurantSchedules.length > 0 ? (
                      restaurantSchedules.map((scheduleItem, index) => (
                        <tr
                          key={scheduleItem.id || index}
                          style={{ borderBottom: "1px solid #eee" }}
                        >
                          <td
                            style={{
                              padding: "12px",
                              fontSize: "14px",
                              border: "1px solid #ddd",
                            }}
                          >
                            {scheduleItem.day_display || "N/A"}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              fontSize: "14px",
                              border: "1px solid #ddd",
                            }}
                          >
                            {editingScheduleId === scheduleItem.id ? (
                              <input
                                type="time"
                                value={
                                  (scheduleDraft.start_time as string) ||
                                  scheduleItem.start_time ||
                                  ""
                                }
                                onChange={(e) =>
                                  handleDraftChange(
                                    "start_time",
                                    e.target.value
                                  )
                                }
                                style={{ width: 110 }}
                              />
                            ) : (
                              scheduleItem.start_time || "N/A"
                            )}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              fontSize: "14px",
                              border: "1px solid #ddd",
                            }}
                          >
                            {editingScheduleId === scheduleItem.id ? (
                              <input
                                type="time"
                                value={
                                  (scheduleDraft.end_time as string) ||
                                  scheduleItem.end_time ||
                                  ""
                                }
                                onChange={(e) =>
                                  handleDraftChange("end_time", e.target.value)
                                }
                                style={{ width: 110 }}
                              />
                            ) : (
                              scheduleItem.end_time || "N/A"
                            )}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              fontSize: "14px",
                              border: "1px solid #ddd",
                            }}
                          >
                            {editingScheduleId === scheduleItem.id ? (
                              <input
                                type="time"
                                value={
                                  (scheduleDraft.break_start_time as string) ||
                                  scheduleItem.break_start_time ||
                                  ""
                                }
                                onChange={(e) =>
                                  handleDraftChange(
                                    "break_start_time",
                                    e.target.value
                                  )
                                }
                                style={{ width: 110 }}
                              />
                            ) : (
                              scheduleItem.break_start_time || "N/A"
                            )}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              fontSize: "14px",
                              border: "1px solid #ddd",
                            }}
                          >
                            {editingScheduleId === scheduleItem.id ? (
                              <input
                                type="time"
                                value={
                                  (scheduleDraft.break_end_time as string) ||
                                  scheduleItem.break_end_time ||
                                  ""
                                }
                                onChange={(e) =>
                                  handleDraftChange(
                                    "break_end_time",
                                    e.target.value
                                  )
                                }
                                style={{ width: 110 }}
                              />
                            ) : (
                              scheduleItem.break_end_time || "N/A"
                            )}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              fontSize: "14px",
                              border: "1px solid #ddd",
                            }}
                          >
                            {editingScheduleId === scheduleItem.id ? (
                              <select
                                value={String(
                                  scheduleDraft.booking_allowed ??
                                    scheduleItem.booking_allowed
                                    ? 1
                                    : 0
                                )}
                                onChange={(e) =>
                                  handleDraftChange(
                                    "booking_allowed",
                                    e.target.value === "1"
                                  )
                                }
                              >
                                <option value="1">Yes</option>
                                <option value="0">No</option>
                              </select>
                            ) : scheduleItem.booking_allowed ? (
                              "Yes"
                            ) : (
                              "No"
                            )}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              fontSize: "14px",
                              border: "1px solid #ddd",
                            }}
                          >
                            {editingScheduleId === scheduleItem.id ? (
                              <select
                                value={String(
                                  scheduleDraft.order_allowed ??
                                    scheduleItem.order_allowed
                                    ? 1
                                    : 0
                                )}
                                onChange={(e) =>
                                  handleDraftChange(
                                    "order_allowed",
                                    e.target.value === "1"
                                  )
                                }
                              >
                                <option value="1">Yes</option>
                                <option value="0">No</option>
                              </select>
                            ) : scheduleItem.order_allowed ? (
                              "Yes"
                            ) : (
                              "No"
                            )}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              fontSize: "14px",
                              border: "1px solid #ddd",
                            }}
                          >
                            {editingScheduleId === scheduleItem.id ? (
                              <input
                                type="time"
                                value={
                                  (scheduleDraft.last_order_time as string) ||
                                  scheduleItem.last_order_time ||
                                  ""
                                }
                                onChange={(e) =>
                                  handleDraftChange(
                                    "last_order_time",
                                    e.target.value
                                  )
                                }
                                style={{ width: 110 }}
                              />
                            ) : (
                              scheduleItem.last_order_time || "N/A"
                            )}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              fontSize: "14px",
                              border: "1px solid #ddd",
                              textAlign: "center",
                            }}
                          >
                            {editingScheduleId === scheduleItem.id ? (
                              <div
                                style={{
                                  display: "flex",
                                  gap: 8,
                                  justifyContent: "center",
                                }}
                              >
                                <button
                                  onClick={() => saveSchedule(scheduleItem)}
                                  disabled={
                                    savingScheduleId === scheduleItem.id
                                  }
                                  style={{
                                    backgroundColor: "#28a745",
                                    color: "white",
                                    border: "none",
                                    padding: "6px 10px",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                    cursor: "pointer",
                                    fontWeight: "500",
                                    opacity:
                                      savingScheduleId === scheduleItem.id
                                        ? 0.6
                                        : 1,
                                  }}
                                >
                                  {savingScheduleId === scheduleItem.id
                                    ? "Saving..."
                                    : "Save"}
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  style={{
                                    backgroundColor: "#6c757d",
                                    color: "white",
                                    border: "none",
                                    padding: "6px 10px",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                    cursor: "pointer",
                                    fontWeight: "500",
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => startEditing(scheduleItem)}
                                style={{
                                  backgroundColor: "#007bff",
                                  color: "white",
                                  border: "none",
                                  padding: "6px 12px",
                                  borderRadius: "4px",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                  fontWeight: "500",
                                }}
                              >
                                Edit
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={9}
                          style={{
                            padding: "20px",
                            textAlign: "center",
                            color: "#666",
                            fontSize: "14px",
                          }}
                        >
                          No schedule data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Menu Section */}
        <div
          style={{
            backgroundColor: "white",
            border: "1px solid #ddd",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              padding: "15px",
              borderBottom: "1px solid #eee",
              fontWeight: "500",
              fontSize: "16px",
            }}
          >
            Menu
          </div>
          <div style={{ padding: "20px" }}>
            {menuImages.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "15px",
                  justifyItems: "center",
                }}
              >
                {menuImages.map((menuImage, index) => (
                  <div
                    key={menuImage.id || index}
                    style={{
                      width: "100%",
                      maxWidth: "250px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      overflow: "hidden",
                      backgroundColor: "#f8f9fa",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      cursor: "pointer",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      position: "relative",
                    }}
                    onClick={() => setSelectedMenuImage(menuImage)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.02)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 8px rgba(0,0,0,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 4px rgba(0,0,0,0.1)";
                    }}
                  >
                    <img
                      src={menuImage.image || menuImage.url}
                      alt={`Menu ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "200px",
                        display: "block",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: "10px",
                        right: "10px",
                        backgroundColor: "rgba(0,0,0,0.7)",
                        color: "white",
                        borderRadius: "50%",
                        width: "30px",
                        height: "30px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        opacity: 0.8,
                      }}
                    >
                      <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{ padding: "40px", textAlign: "center", color: "#666" }}
              >
                No menu images available
              </div>
            )}
          </div>
        </div>

        {/* Other Info */}
        <div
          style={{
            backgroundColor: "white",
            border: "1px solid #ddd",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              padding: "15px",
              borderBottom: "1px solid #eee",
              fontWeight: "500",
              fontSize: "16px",
            }}
          >
            Other Info
          </div>
          <div style={{ padding: "15px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "20px",
                fontSize: "14px",
              }}
            >
              <div>
                <div style={{ fontWeight: "500", marginBottom: "5px" }}>
                  Phone Number
                </div>
                <div style={{ color: "#666" }}>
                  {restaurant.number || "1234556777"}
                </div>
              </div>
              <div>
                <div style={{ fontWeight: "500", marginBottom: "5px" }}>
                  Booking Allowed
                </div>
                <div style={{ color: "#666" }}>Yes</div>
              </div>
              <div>
                <div style={{ fontWeight: "500", marginBottom: "5px" }}>
                  Cancel Before Schedule
                </div>
                <div style={{ color: "#666" }}>
                  {tableBooking?.can_cancel_before || "50 Mins."}
                </div>
              </div>
              <div>
                <div style={{ fontWeight: "500", marginBottom: "5px" }}>
                  Closing Message
                </div>
                <div style={{ color: "#666" }}>
                  {restaurant.closing_message || "Thank You"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div
          style={{
            backgroundColor: "white",
            border: "1px solid #ddd",
            borderRadius: "4px",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              padding: "15px",
              borderBottom: restaurant.terms_and_conditions
                ? "1px solid #eee"
                : "none",
              fontWeight: "500",
              fontSize: "16px",
            }}
          >
            Terms & Conditions
          </div>
          {restaurant.terms_and_conditions && (
            <div
              style={{
                padding: "15px",
                color: "#555",
                lineHeight: "1.5",
                fontSize: "14px",
              }}
            >
              {restaurant.terms_and_conditions}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div
          style={{
            backgroundColor: "white",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        >
          <div
            style={{
              padding: "15px",
              fontWeight: "500",
              fontSize: "16px",
            }}
          >
            Disclaimer
          </div>
        </div>
      </div>

      {/* Image Modal/Lightbox */}
      {selectedMenuImage && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => setSelectedMenuImage(null)}
        >
          <div
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
              backgroundColor: "white",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedMenuImage.image || selectedMenuImage.url}
              alt="Menu Image"
              style={{
                width: "100%",
                height: "100%",
                maxWidth: "90vw",
                maxHeight: "90vh",
                objectFit: "contain",
                display: "block",
              }}
            />
            <button
              onClick={() => setSelectedMenuImage(null)}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                fontSize: "18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
