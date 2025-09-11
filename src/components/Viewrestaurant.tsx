import { useEffect, useState } from "react";
import {
  retrieveRestaurant,
  listSchedules,
  listTableBookings,
  listGalleryImages,
} from "../api/endpoints";

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

interface Schedule {
  operational_days?: string[];
  start_time?: string;
  end_time?: string;
  booking_allowed?: boolean;
  last_booking_time?: string;
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

export default function Viewrestaurant({ id, onBack }: Props) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [tableBooking, setTableBooking] = useState<TableBooking | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const restaurantData = await retrieveRestaurant(id);
        setRestaurant(restaurantData);
        const schedules = await listSchedules({ restaurant: id });
        setSchedule(schedules[0] || null);
        const tb = await listTableBookings({ restaurant: id });
        setTableBooking(tb[0] || null);
        const gallery = await listGalleryImages({ restaurant: id });
        setGalleryImages(Array.isArray(gallery) ? gallery : []);
      } catch (e: any) {
        setError("Failed to load");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

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
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "600" }}>
          {name}
        </h2>
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
            Restaurant Schedule ▼
          </button>
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
          <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
            {/* Menu content would go here */}
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
                <div style={{ color: "#666" }}>
                  {schedule?.booking_allowed ? "Yes" : "Yes"}
                </div>
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
    </div>
  );
}
