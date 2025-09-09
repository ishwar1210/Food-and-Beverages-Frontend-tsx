import React, { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import "./Addestaurant.css";

type Cuisine = {
  id?: number | string;
  _id?: string;
  name?: string;
  title?: string;
};

type FormDataShape = {
  restaurantName: string;
  mobileNumber: string;
  ownerName: string;
  emailAddress: string;
  website: string;
  address: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  aboutRestaurant: string;
  cuisines: string | number;
};

type ScheduleDataShape = {
  operationalDays: Record<string, boolean>;
  startTime: string;
  endTime: string;
  bookingAllowed: boolean;
  bookingStartTime: string;
  bookingEndTime: string;
  orderAllowed: boolean;
  lastOrderTime: string;
};

export default function Restaurant(): React.ReactElement {
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basicDetails: false,
    restaurantDetails: false,
    blockedDays: false,
    tableBookings: false,
    orderConfigure: false,
    attachments: false,
  });

  const [formData, setFormData] = useState<FormDataShape>({
    restaurantName: "",
    mobileNumber: "",
    ownerName: "",
    emailAddress: "",
    website: "",
    address: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    aboutRestaurant: "",
    cuisines: "",
  });

  const [scheduleData, setScheduleData] = useState<ScheduleDataShape>({
    operationalDays: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
    startTime: "",
    endTime: "",
    bookingAllowed: false,
    bookingStartTime: "",
    bookingEndTime: "",
    orderAllowed: false,
    lastOrderTime: "",
  });

  const [blockedDaysData, setBlockedDaysData] = useState({
    orderBlocked: true,
    bookingBlocked: false,
    startDate: "",
    endDate: "",
  });

  const [tableBookingsData, setTableBookingsData] = useState({
    numberOfTables: "",
    minimumPerson: "",
    maximumPerson: "",
    canCancelBefore: "",
    bookingNotAvailableText: "",
    noOfFloors: "",
  });

  const [orderConfigData, setOrderConfigData] = useState({
    gstPercentage: "",
    deliveryCharge: "",
    serviceChargePercentage: "",
    minimumOrder: "",
    orderNotAllowedText: "",
  });

  const [coverImageData, setCoverImageData] = useState<{
    coverImage: File | null;
  }>({
    coverImage: null,
  });

  const [menuImageData, setMenuImageData] = useState<{
    menuImage: File | null;
  }>({
    menuImage: null,
  });

  const [galleryImageData, setGalleryImageData] = useState<{
    galleryImages: File[];
  }>({
    galleryImages: [],
  });

  const [otherFilesData, setOtherFilesData] = useState<{ otherFiles: File[] }>({
    otherFiles: [],
  });

  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [loadingCuisines, setLoadingCuisines] = useState(true);

  useEffect(() => {
    const fetchCuisines = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8001/api/cuisines/", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          const cuisinesArray: Cuisine[] = Array.isArray(data)
            ? data
            : data.results || data.data || [];
          setCuisines(cuisinesArray);
        } else if (response.status === 403) {
          const fallback: Cuisine[] = [
            { id: 1, name: "Italian" },
            { id: 2, name: "Chinese" },
            { id: 3, name: "Indian" },
          ];
          setCuisines(fallback);
        } else {
          setCuisines([]);
        }
      } catch (error) {
        const fallback: Cuisine[] = [
          { id: 1, name: "Italian" },
          { id: 2, name: "Chinese" },
          { id: 3, name: "Indian" },
        ];
        setCuisines(fallback);
      } finally {
        setLoadingCuisines(false);
      }
    };
    fetchCuisines();
  }, []);

  const handleAddRestaurant = () => setShowAddForm(true);
  const handleBackToTable = () => setShowAddForm(false);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleScheduleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    if (name.startsWith("day_") || name.startsWith("day.")) {
      const day = name.replace(/^(day_|day\.)/, "");
      setScheduleData((prev) => ({
        ...prev,
        operationalDays: { ...prev.operationalDays, [day]: checked },
      }));
      return;
    }

    if (type === "checkbox") {
      setScheduleData((prev) => ({ ...prev, [name]: checked } as any));
    } else {
      setScheduleData((prev) => ({ ...prev, [name]: value } as any));
    }
  };

  const handleBlockedDaysChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    if (type === "checkbox") {
      setBlockedDaysData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setBlockedDaysData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBlockedDaysSubmit = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8001/api/blocked-days/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blockedDaysData),
      });
      if (response.ok) alert("Blocked days saved successfully!");
      else alert("Error saving blocked days.");
    } catch (error) {
      alert("Network error while saving blocked days.");
    }
  };

  const handleTableBookingsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setTableBookingsData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOrderConfigChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setOrderConfigData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCoverImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) setCoverImageData({ coverImage: file });
  };

  const handleMenuImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) setMenuImageData({ menuImage: file });
  };

  const handleGalleryImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length) setGalleryImageData({ galleryImages: files });
  };

  const handleOtherFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length) setOtherFilesData({ otherFiles: files });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Implementation mirrors provided JS: sequentially POST multiple endpoints.
    let allSuccess = true;
    const errorMessages: string[] = [];

    try {
      // Basic restaurant details
      try {
        const res = await fetch("http://127.0.0.1:8001/api/restaurants/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) {
          allSuccess = false;
          errorMessages.push("Failed to save restaurant basic details");
        }
      } catch (err) {
        allSuccess = false;
        errorMessages.push("Error saving restaurant basic details");
      }

      // Schedule
      try {
        const res = await fetch("http://127.0.0.1:8001/api/schedules/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(scheduleData),
        });
        if (!res.ok) {
          allSuccess = false;
          errorMessages.push("Failed to save restaurant schedule");
        }
      } catch (err) {
        allSuccess = false;
        errorMessages.push("Error saving restaurant schedule");
      }

      // Blocked days
      try {
        const res = await fetch("http://127.0.0.1:8001/api/blocked-days/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(blockedDaysData),
        });
        if (!res.ok) {
          allSuccess = false;
          errorMessages.push("Failed to save blocked days");
        }
      } catch (err) {
        allSuccess = false;
        errorMessages.push("Error saving blocked days");
      }

      // Table bookings
      try {
        const res = await fetch("http://127.0.0.1:8001/api/table-bookings/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tableBookingsData),
        });
        if (!res.ok) {
          allSuccess = false;
          errorMessages.push("Failed to save table bookings");
        }
      } catch (err) {
        allSuccess = false;
        errorMessages.push("Error saving table bookings");
      }

      // Order config
      try {
        const res = await fetch("http://127.0.0.1:8001/api/order-configs/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderConfigData),
        });
        if (!res.ok) {
          allSuccess = false;
          errorMessages.push("Failed to save order configure");
        }
      } catch (err) {
        allSuccess = false;
        errorMessages.push("Error saving order configure");
      }

      // Images and files (only if provided)
      if (coverImageData.coverImage) {
        try {
          const fd = new FormData();
          fd.append("coverImage", coverImageData.coverImage);
          const res = await fetch("http://127.0.0.1:8001/api/cover-images/", {
            method: "POST",
            body: fd,
          });
          if (!res.ok) {
            allSuccess = false;
            errorMessages.push("Failed to upload cover image");
          }
        } catch (err) {
          allSuccess = false;
          errorMessages.push("Error uploading cover image");
        }
      }

      if (menuImageData.menuImage) {
        try {
          const fd = new FormData();
          fd.append("menuImage", menuImageData.menuImage);
          const res = await fetch("http://127.0.0.1:8001/api/menu-images/", {
            method: "POST",
            body: fd,
          });
          if (!res.ok) {
            allSuccess = false;
            errorMessages.push("Failed to upload menu image");
          }
        } catch (err) {
          allSuccess = false;
          errorMessages.push("Error uploading menu image");
        }
      }

      if (galleryImageData.galleryImages.length > 0) {
        try {
          const fd = new FormData();
          galleryImageData.galleryImages.forEach((file, i) =>
            fd.append(`galleryImage_${i}`, file)
          );
          const res = await fetch("http://127.0.0.1:8001/api/gallery-images/", {
            method: "POST",
            body: fd,
          });
          if (!res.ok) {
            allSuccess = false;
            errorMessages.push("Failed to upload gallery images");
          }
        } catch (err) {
          allSuccess = false;
          errorMessages.push("Error uploading gallery images");
        }
      }

      if (otherFilesData.otherFiles.length > 0) {
        try {
          const fd = new FormData();
          otherFilesData.otherFiles.forEach((file, i) =>
            fd.append(`otherFile_${i}`, file)
          );
          const res = await fetch("http://127.0.0.1:8001/api/other-files/", {
            method: "POST",
            body: fd,
          });
          if (!res.ok) {
            allSuccess = false;
            errorMessages.push("Failed to upload other files");
          }
        } catch (err) {
          allSuccess = false;
          errorMessages.push("Error uploading other files");
        }
      }

      if (allSuccess) {
        alert("All restaurant data saved successfully!");
        // reset
        setShowAddForm(false);
      } else {
        alert(`Some data could not be saved:\n${errorMessages.join("\n")}`);
      }
    } catch (err) {
      alert("General error while saving restaurant data.");
    }
  };

  const toggleSection = (sectionName: keyof typeof expandedSections) => {
    setExpandedSections((prev) => {
      const newState = {
        basicDetails: false,
        restaurantDetails: false,
        blockedDays: false,
        tableBookings: false,
        orderConfigure: false,
        attachments: false,
      } as typeof prev;
      newState[sectionName] = !prev[sectionName];
      return newState;
    });
  };

  const orderData = [
    {
      orderId: "001",
      restaurant: "Pizza Palace",
      createdOn: "2024-01-15",
      createdBy: "Admin",
      flat: "A-101",
      status: "Active",
      amountPaid: "₹1,250",
      noOfItems: "3",
      paymentStatus: "Paid",
      additionalRequest: "Extra cheese",
    },
    {
      orderId: "002",
      restaurant: "Burger King",
      createdOn: "2024-01-16",
      createdBy: "User1",
      flat: "B-205",
      status: "Pending",
      amountPaid: "₹850",
      noOfItems: "2",
      paymentStatus: "Pending",
      additionalRequest: "No onions",
    },
    {
      orderId: "003",
      restaurant: "Subway",
      createdOn: "2024-01-17",
      createdBy: "User2",
      flat: "C-301",
      status: "Delivered",
      amountPaid: "₹450",
      noOfItems: "1",
      paymentStatus: "Paid",
      additionalRequest: "Extra sauce",
    },
  ];

  // Small inline SVG icon components
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

  const ViewIcon = ({ size = 16 }: { size?: number }) => (
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
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const UploadIcon = ({ size = 24 }: { size?: number }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
    >
      <path
        d="M12 15V3m0 0L8 7m4-4l4 4m6 6v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );

  if (showAddForm) {
    return (
      <div className="restaurant-container" style={{ paddingLeft: "40px" }}>
        <div className="form-header">
          <button className="back-btn" onClick={handleBackToTable}>
            ← Back to Restaurant List
          </button>
          <h2>Add Restaurant</h2>
        </div>

        <form className="restaurant-form" onSubmit={handleSubmit}>
          {/* Basic Details Section */}
          <div className="form-section">
            <div className="expandable-section">
              <button
                type="button"
                className="expand-btn"
                onClick={() => toggleSection("basicDetails")}
              >
                Basic Details {expandedSections.basicDetails ? "▲" : "▼"}
              </button>
              {expandedSections.basicDetails && (
                <div className="expanded-content">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Restaurant Name*</label>
                      <input
                        type="text"
                        name="restaurantName"
                        value={formData.restaurantName}
                        onChange={handleInputChange}
                        placeholder="Restaurant Name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Cost For Two*</label>
                      <input type="text" placeholder="Cost For Two" />
                    </div>
                    <div className="form-group">
                      <label>Mobile Number*</label>
                      <input
                        type="text"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleInputChange}
                        placeholder="Enter Number"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Another Mobile Number*</label>
                      <input type="text" placeholder="Enter Number" />
                    </div>
                    <div className="form-group">
                      <label>Landline Number</label>
                      <input type="text" placeholder="Enter Number" />
                    </div>
                    <div className="form-group">
                      <label>Delivery Time</label>
                      <input type="text" placeholder="Mins" />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Cuisines</label>
                      <select
                        name="cuisines"
                        value={formData.cuisines}
                        onChange={handleInputChange}
                      >
                        <option value="">
                          {loadingCuisines ? "Loading..." : "Select Cuisines"}
                        </option>
                        {cuisines && cuisines.length > 0
                          ? cuisines.map((c) => (
                              <option key={c.id ?? c._id} value={c.id ?? c._id}>
                                {c.name ?? c.title ?? "Unknown Cuisine"}
                              </option>
                            ))
                          : !loadingCuisines && (
                              <option disabled>No cuisines available</option>
                            )}
                      </select>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#666",
                          marginTop: "5px",
                        }}
                      >
                        Debug: {cuisines.length} cuisines loaded, Loading:{" "}
                        {loadingCuisines.toString()}
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Drink Alcohol*</label>
                      <select>
                        <option>Select</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Wheelchair Accessible*</label>
                      <select>
                        <option>Select</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Cash On Delivery*</label>
                      <select>
                        <option>Select</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Pure Veg*</label>
                      <select>
                        <option>Select</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Terms & Conditions</label>
                      <textarea rows={3}></textarea>
                    </div>
                    <div className="form-group">
                      <label>Closing Message</label>
                      <textarea rows={3}></textarea>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Restaurant Details Section */}
          <div className="form-section">
            <div className="expandable-section">
              <button
                type="button"
                className="expand-btn"
                onClick={() => toggleSection("restaurantDetails")}
              >
                Restaurant Details{" "}
                {expandedSections.restaurantDetails ? "▲" : "▼"}
              </button>
              {expandedSections.restaurantDetails && (
                <div className="expanded-content">
                  {/* Select Operational Dates Section */}
                  <div className="restaurant-details-row">
                    <div className="left-section">
                      <label className="section-label">
                        Select Operational Dates
                      </label>
                      <div className="checkbox-row">
                        <label className="checkbox-label">
                          <input type="checkbox" /> All
                        </label>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            name="day_monday"
                            checked={scheduleData.operationalDays.monday}
                            onChange={handleScheduleChange}
                          />{" "}
                          M
                        </label>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            name="day_tuesday"
                            checked={scheduleData.operationalDays.tuesday}
                            onChange={handleScheduleChange}
                          />{" "}
                          T
                        </label>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            name="day_wednesday"
                            checked={scheduleData.operationalDays.wednesday}
                            onChange={handleScheduleChange}
                          />{" "}
                          W
                        </label>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            name="day_thursday"
                            checked={scheduleData.operationalDays.thursday}
                            onChange={handleScheduleChange}
                          />{" "}
                          T
                        </label>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            name="day_friday"
                            checked={scheduleData.operationalDays.friday}
                            onChange={handleScheduleChange}
                          />{" "}
                          F
                        </label>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            name="day_saturday"
                            checked={scheduleData.operationalDays.saturday}
                            onChange={handleScheduleChange}
                          />{" "}
                          S
                        </label>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            name="day_sunday"
                            checked={scheduleData.operationalDays.sunday}
                            onChange={handleScheduleChange}
                          />{" "}
                          S
                        </label>
                      </div>
                    </div>
                    <div className="right-section">
                      <div className="time-fields">
                        <div className="form-group">
                          <label>Start Time</label>
                          <input
                            type="time"
                            name="startTime"
                            value={scheduleData.startTime}
                            onChange={handleScheduleChange}
                          />
                        </div>
                        <div className="form-group">
                          <label>End Time</label>
                          <input
                            type="time"
                            name="endTime"
                            value={scheduleData.endTime}
                            onChange={handleScheduleChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Allowed Section */}
                  <div className="restaurant-details-row">
                    <div className="left-section">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="bookingAllowed"
                          checked={scheduleData.bookingAllowed}
                          onChange={handleScheduleChange}
                        />{" "}
                        Booking Allowed
                      </label>
                    </div>
                    <div className="right-section">
                      <div className="time-fields">
                        <div className="form-group">
                          <label>Break Start Time</label>
                          <input
                            type="time"
                            name="bookingStartTime"
                            value={scheduleData.bookingStartTime}
                            onChange={handleScheduleChange}
                          />
                        </div>
                        <div className="form-group">
                          <label>Break End Time</label>
                          <input
                            type="time"
                            name="bookingEndTime"
                            value={scheduleData.bookingEndTime}
                            onChange={handleScheduleChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Allowed Section */}
                  <div className="restaurant-details-row">
                    <div className="left-section">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="orderAllowed"
                          checked={scheduleData.orderAllowed}
                          onChange={handleScheduleChange}
                        />{" "}
                        Order Allowed
                      </label>
                    </div>
                    <div className="right-section">
                      <div
                        className="form-group single-field"
                        style={{ position: "relative", left: "85%" }}
                      >
                        <label>Last Booking & Order Time</label>
                        <input
                          type="time"
                          name="lastOrderTime"
                          value={scheduleData.lastOrderTime}
                          onChange={handleScheduleChange}
                          style={{ width: "150px" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Blocked Days Section */}
          <div className="form-section">
            <div className="expandable-section">
              <button
                type="button"
                className="expand-btn"
                onClick={() => toggleSection("blockedDays")}
              >
                Blocked Days {expandedSections.blockedDays ? "▲" : "▼"}
              </button>
              {expandedSections.blockedDays && (
                <div className="expanded-content">
                  <div className="blocked-days-header">
                    <button
                      type="button"
                      className="add-blocked-day-btn"
                      onClick={handleBlockedDaysSubmit}
                    >
                      Add
                    </button>
                  </div>
                  <div className="blocked-day-row">
                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="orderBlocked"
                          checked={blockedDaysData.orderBlocked}
                          onChange={handleBlockedDaysChange}
                        />{" "}
                        Order
                      </label>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="bookingBlocked"
                          checked={blockedDaysData.bookingBlocked}
                          onChange={handleBlockedDaysChange}
                        />{" "}
                        Booking
                      </label>
                    </div>
                    <div className="date-fields">
                      <div className="form-group">
                        <label>Start Date</label>
                        <input
                          type="date"
                          name="startDate"
                          value={blockedDaysData.startDate}
                          onChange={handleBlockedDaysChange}
                          placeholder="dd-mm-yyyy"
                        />
                      </div>
                      <div className="form-group">
                        <label>End Date</label>
                        <input
                          type="date"
                          name="endDate"
                          value={blockedDaysData.endDate}
                          onChange={handleBlockedDaysChange}
                          placeholder="dd-mm-yyyy"
                        />
                      </div>
                    </div>
                    <button type="button" className="delete-blocked-day-btn">
                      <DeleteIcon size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Table Bookings Section */}
          <div className="form-section">
            <div className="expandable-section">
              <button
                type="button"
                className="expand-btn"
                onClick={() => toggleSection("tableBookings")}
              >
                Table Bookings {expandedSections.tableBookings ? "▲" : "▼"}
              </button>
              {expandedSections.tableBookings && (
                <div className="expanded-content">
                  <div className="table-booking-row">
                    <div className="form-group">
                      <label>Number of Tables</label>
                      <input
                        type="text"
                        name="numberOfTables"
                        value={tableBookingsData.numberOfTables}
                        onChange={handleTableBookingsChange}
                        placeholder="Enter Tables"
                      />
                    </div>
                    <div className="form-group">
                      <label>Minimum Person</label>
                      <input
                        type="text"
                        name="minimumPerson"
                        value={tableBookingsData.minimumPerson}
                        onChange={handleTableBookingsChange}
                        placeholder="Minimum Person"
                      />
                    </div>
                    <div className="form-group">
                      <label>Maximum Person</label>
                      <input
                        type="text"
                        name="maximumPerson"
                        value={tableBookingsData.maximumPerson}
                        onChange={handleTableBookingsChange}
                        placeholder="Maximum Person"
                      />
                    </div>
                  </div>
                  <div className="table-booking-row">
                    <div className="form-group">
                      <label>Can Cancel Before</label>
                      <input
                        type="text"
                        name="canCancelBefore"
                        value={tableBookingsData.canCancelBefore}
                        onChange={handleTableBookingsChange}
                        placeholder="In Mins"
                      />
                    </div>
                    <div className="form-group">
                      <label>Booking Not Available Text</label>
                      <input
                        type="text"
                        name="bookingNotAvailableText"
                        value={tableBookingsData.bookingNotAvailableText}
                        onChange={handleTableBookingsChange}
                        placeholder="Booking Not Available Text"
                      />
                    </div>
                    <div className="form-group">
                      <label>No of Floors</label>
                      <input
                        type="text"
                        name="noOfFloors"
                        value={tableBookingsData.noOfFloors}
                        onChange={handleTableBookingsChange}
                        placeholder="No of Floors"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Configure Section */}
          <div className="form-section">
            <div className="expandable-section">
              <button
                type="button"
                className="expand-btn"
                onClick={() => toggleSection("orderConfigure")}
              >
                Order Configure {expandedSections.orderConfigure ? "▲" : "▼"}
              </button>
              {expandedSections.orderConfigure && (
                <div className="expanded-content">
                  <div className="order-configure-row">
                    <div className="form-group">
                      <label>GST%</label>
                      <input
                        type="text"
                        name="gstPercentage"
                        value={orderConfigData.gstPercentage}
                        onChange={handleOrderConfigChange}
                        placeholder="GST%"
                      />
                    </div>
                    <div className="form-group">
                      <label>Delivery Charge</label>
                      <input
                        type="text"
                        name="deliveryCharge"
                        value={orderConfigData.deliveryCharge}
                        onChange={handleOrderConfigChange}
                        placeholder="Delivery Charge"
                      />
                    </div>
                    <div className="form-group">
                      <label>Service Charge%</label>
                      <input
                        type="text"
                        name="serviceChargePercentage"
                        value={orderConfigData.serviceChargePercentage}
                        onChange={handleOrderConfigChange}
                        placeholder="Service Charge%"
                      />
                    </div>
                  </div>
                  <div className="order-configure-row">
                    <div className="form-group">
                      <label>Minimum Order</label>
                      <input
                        type="text"
                        name="minimumOrder"
                        value={orderConfigData.minimumOrder}
                        onChange={handleOrderConfigChange}
                        placeholder="Minimum Order"
                      />
                    </div>
                    <div className="form-group">
                      <label>Order Not Allowed Text</label>
                      <input
                        type="text"
                        name="orderNotAllowedText"
                        value={orderConfigData.orderNotAllowedText}
                        onChange={handleOrderConfigChange}
                        placeholder="Order Not Allowed Text"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Attachments Section */}
          <div className="form-section">
            <div className="expandable-section">
              <button
                type="button"
                className="expand-btn"
                onClick={() => toggleSection("attachments")}
              >
                Attachments {expandedSections.attachments ? "▲" : "▼"}
              </button>
              {expandedSections.attachments && (
                <div className="expanded-content">
                  <div className="attachment-row">
                    <div className="attachment-group">
                      <label>Cover Image</label>
                      <div className="file-upload">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverImageChange}
                          style={{ display: "none" }}
                          id="cover-image-input"
                        />
                        <label
                          htmlFor="cover-image-input"
                          style={{ cursor: "pointer", display: "block" }}
                        >
                          <div className="upload-icon">
                            <UploadIcon size={24} />
                          </div>
                          <span>
                            {coverImageData.coverImage
                              ? coverImageData.coverImage.name
                              : "Click to Upload"}
                          </span>
                        </label>
                      </div>
                    </div>
                    <div className="attachment-group">
                      <label>Menu</label>
                      <div className="file-upload">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleMenuImageChange}
                          style={{ display: "none" }}
                          id="menu-image-input"
                        />
                        <label
                          htmlFor="menu-image-input"
                          style={{ cursor: "pointer", display: "block" }}
                        >
                          <div className="upload-icon">
                            <UploadIcon size={24} />
                          </div>
                          <span>
                            {menuImageData.menuImage
                              ? menuImageData.menuImage.name
                              : "Click to Upload"}
                          </span>
                        </label>
                      </div>
                    </div>
                    <div className="attachment-group">
                      <label>Gallery</label>
                      <div className="file-upload">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleGalleryImageChange}
                          style={{ display: "none" }}
                          id="gallery-image-input"
                        />
                        <label
                          htmlFor="gallery-image-input"
                          style={{ cursor: "pointer", display: "block" }}
                        >
                          <div className="upload-icon">
                            <UploadIcon size={24} />
                          </div>
                          <span>
                            {galleryImageData.galleryImages &&
                            galleryImageData.galleryImages.length > 0
                              ? `${galleryImageData.galleryImages.length} image(s) selected`
                              : "Click to Upload Multiple Images"}
                          </span>
                        </label>
                      </div>
                    </div>
                    <div className="attachment-group">
                      <label>Other Files</label>
                      <div className="file-upload">
                        <input
                          type="file"
                          multiple
                          onChange={handleOtherFilesChange}
                          style={{ display: "none" }}
                          id="other-files-input"
                        />
                        <label
                          htmlFor="other-files-input"
                          style={{ cursor: "pointer", display: "block" }}
                        >
                          <div className="upload-icon">
                            <UploadIcon size={24} />
                          </div>
                          <span>
                            {otherFilesData.otherFiles &&
                            otherFilesData.otherFiles.length > 0
                              ? `${otherFilesData.otherFiles.length} file(s) selected`
                              : "Click to Upload Multiple Files"}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="save-btn">
              Save
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="restaurant-container" style={{ paddingLeft: "40px" }}>
      <div className="restaurant-header">
        <div className="search-container">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search restaurants..."
            className="search-input"
          />
        </div>
        <button className="add-restaurant-btn" onClick={handleAddRestaurant}>
          Add Restaurant
        </button>
        <div className="pagination-info">
          1-{orderData.length} of {orderData.length}
        </div>
        <div className="pagination-controls">
          <button className="pagination-btn">‹</button>
          <button className="pagination-btn">›</button>
        </div>
      </div>

      <div className="restaurant-table-container">
        <table className="restaurant-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: "4%" }}>Action</th>
              <th>Order ID</th>
              <th>Restaurant</th>
              <th>Created on</th>
              <th>Created By</th>
              <th>Flat</th>
              <th>Status</th>
              <th>Amount Paid</th>
              <th>No. Of Items</th>
              <th>Payment Status</th>
              <th>Additional Request</th>
            </tr>
          </thead>
          <tbody>
            {orderData.map((order) => (
              <tr key={order.orderId}>
                <td>
                  <div className="action-icons">
                    <button
                      className="action-btn edit-btn"
                      title="Edit"
                      onClick={() => alert(`Edit order ${order.orderId}`)}
                    >
                      <EditIcon />
                    </button>
                    <button
                      className="action-btn delete-btn"
                      title="Delete"
                      onClick={() => alert(`Delete order ${order.orderId}`)}
                    >
                      <DeleteIcon />
                    </button>
                    <button
                      className="action-btn view-btn"
                      title="View"
                      onClick={() => alert(`View order ${order.orderId}`)}
                    >
                      <ViewIcon />
                    </button>
                  </div>
                </td>
                <td>{order.orderId}</td>
                <td>{order.restaurant}</td>
                <td>{order.createdOn}</td>
                <td>{order.createdBy}</td>
                <td>{order.flat}</td>
                <td>{order.status}</td>
                <td>{order.amountPaid}</td>
                <td>{order.noOfItems}</td>
                <td>{order.paymentStatus}</td>
                <td>{order.additionalRequest}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
