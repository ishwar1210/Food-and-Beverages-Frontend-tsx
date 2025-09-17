import React, { useEffect, useState, useRef } from "react";
import { useToast } from "./toast/ToastProvider";
import type { ChangeEvent, FormEvent } from "react";
// Use centralized API helpers instead of hardcoded fetch calls
import {
  listMasterCuisines,
  createCuisine,
  listRestaurants,
  createRestaurant,
  createRestaurantSchedulesBulk,
  createBlockedDay,
  createTableBooking,
  createOrderConfig,
  uploadCoverImage,
  uploadMenuImage,
  uploadGalleryImage,
  uploadOtherFile,
  deleteRestaurant,
  updateRestaurant,
  patchRestaurant,
} from "../api/endpoints";
import "./Addestaurant.css";
import Viewrestaurant from "./Viewrestaurant";

type Cuisine = {
  id?: number | string;
  _id?: string;
  name?: string;
  title?: string;
};

type FormDataShape = {
  restaurantName: string;
  mobileNumber: string;
  alternativeNumber: string;
  landlineNumber: string;
  deliveryTime: string;
  ownerName: string;
  emailAddress: string;
  website: string;
  address: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  aboutRestaurant: string;
  cuisines: string[];
  drinkAlcohol: string;
  wheelchairAccessible: string;
  cashOnDelivery: string;
  pureVeg: string;
  costForTwo: string;
  termsAndConditions: string;
  disclaimer: string;
  closingMessage: string;
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
  const [viewingRestaurantId, setViewingRestaurantId] = useState<number | null>(
    null
  );
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
    alternativeNumber: "",
    landlineNumber: "",
    deliveryTime: "",
    ownerName: "",
    emailAddress: "",
    website: "",
    address: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    aboutRestaurant: "",
    cuisines: [],
    drinkAlcohol: "",
    wheelchairAccessible: "",
    cashOnDelivery: "",
    pureVeg: "",
    costForTwo: "",
    termsAndConditions: "",
    disclaimer: "",
    closingMessage: "",
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
    orderBlocked: false, // default unchecked
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
    menuImages: File[];
  }>({
    menuImages: [],
  });

  const [galleryImageData, setGalleryImageData] = useState<{
    galleryImages: File[];
  }>({
    galleryImages: [],
  });

  const [otherFilesData, setOtherFilesData] = useState<{ otherFiles: File[] }>({
    otherFiles: [],
  });

  // Phone validation errors (10 digit requirement)
  const [phoneErrors, setPhoneErrors] = useState<{
    mobileNumber: string;
    alternativeNumber: string;
  }>({ mobileNumber: "", alternativeNumber: "" });

  const [cuisines, setCuisines] = useState<Cuisine[]>([]);

  useEffect(() => {
    const fetchCuisines = async () => {
      try {
        // Use master-cuisines API for dropdown
        const data = await listMasterCuisines();
        // normalize to [{ id, name }] to keep UI consistent with other components
        const normalized = Array.isArray(data)
          ? data.map((c: any) => ({
              id: c.id ?? c.pk ?? c.value ?? c._id ?? 0,
              name: c.name ?? c.title ?? c.label ?? String(c),
            }))
          : [];
        setCuisines(normalized.filter((c: any) => c.id));
      } catch (err) {
        setCuisines([]);
      } finally {
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

    // Enforce 10 digit numeric only for mobile fields
    if (name === "mobileNumber" || name === "alternativeNumber") {
      const digits = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: digits }));
      setPhoneErrors((prev) => ({
        ...prev,
        [name]:
          digits.length === 10 || digits.length === 0
            ? ""
            : "10 digits required",
      }));
      return;
    }

    // handle multi-select cuisines
    if (name === "cuisines") {
      const sel = e.target as HTMLSelectElement;
      const values = Array.from(sel.selectedOptions).map((o) =>
        String(o.value)
      );
      setFormData((prev) => ({ ...prev, cuisines: values } as any));
      return;
    }

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
      await createBlockedDay(blockedDaysData);
      alert("Blocked days saved successfully!");
    } catch (error) {
      alert("Error saving blocked days.");
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
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length) {
      setMenuImageData((prev) => ({
        menuImages: [...prev.menuImages, ...files],
      }));
    }
  };

  const handleGalleryImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 2) {
      toast.error("Maximum 2 gallery images allowed");
      e.target.value = ""; // Reset input
      return;
    }
    if (files.length) setGalleryImageData({ galleryImages: files });
  };

  const handleOtherFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length) setOtherFilesData({ otherFiles: files });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Pre-submit phone validation
    const mobileValid = formData.mobileNumber.length === 10;
    const altValid = formData.alternativeNumber.length === 10;
    if (!mobileValid || !altValid) {
      setPhoneErrors((prev) => ({
        ...prev,
        mobileNumber: mobileValid
          ? prev.mobileNumber || ""
          : "10 digits required",
        alternativeNumber: altValid
          ? prev.alternativeNumber || ""
          : "10 digits required",
      }));
      alert("Please enter valid 10 digit Mobile Number(s).");
      return;
    }
    // Implementation mirrors provided JS: sequentially POST multiple endpoints.
    let allSuccess = true;
    const errorMessages: string[] = [];

    try {
      // 1. Build restaurant payload mapping to backend model
      const restaurantPayload: any = {
        restaurant_name: formData.restaurantName,
        address: formData.address,
        number: formData.mobileNumber,
        alternative_number: formData.alternativeNumber || formData.mobileNumber,
        landline_number: formData.landlineNumber || formData.mobileNumber,
        // Backend rejects null for delivery_time; send empty string instead
        delivery_time:
          formData.deliveryTime !== "" ? formData.deliveryTime : "",
        serves_alcohol: formData.drinkAlcohol === "yes",
        wheelchair_accessible: formData.wheelchairAccessible === "yes",
        cash_on_delivery: formData.cashOnDelivery === "yes",
        pure_veg: formData.pureVeg === "yes",
        // cuisines will be saved separately below
        terms_and_conditions: formData.termsAndConditions || "",
        disclaimer: formData.disclaimer || "",
        closing_message: formData.closingMessage || "",
        cost_for_two: formData.costForTwo ? parseFloat(formData.costForTwo) : 0,
      };
      let restaurantId: number | null = null;
      let scheduleId: number | null = null;

      // Basic restaurant details
      try {
        const created = await createRestaurant(restaurantPayload);
        restaurantId =
          created?.id ??
          created?.restaurant?.id ??
          created?.restaurant_id ??
          null;
        if (!restaurantId) throw new Error("No restaurant id in response");
        // Save each selected cuisine to /api/cuisines/ (one POST per selection)
        if (
          formData.cuisines &&
          Array.isArray(formData.cuisines) &&
          formData.cuisines.length
        ) {
          for (const masterCuisineIdRaw of formData.cuisines) {
            try {
              const masterCuisineId = String(masterCuisineIdRaw);
              const masterCuisineIdNum = Number(masterCuisineIdRaw);
              const selectedMaster = cuisines.find(
                (c) =>
                  String(c.id) === masterCuisineId ||
                  String(c._id) === masterCuisineId ||
                  String(c.name) === masterCuisineId
              );
              const cuisineName =
                selectedMaster?.name ||
                selectedMaster?.title ||
                masterCuisineId;
              // send numeric master_cuisine and a few compatibility keys so backend accepts it
              const payload: any = {
                name: cuisineName,
                restaurant: restaurantId,
                master_cuisine: Number.isFinite(masterCuisineIdNum)
                  ? masterCuisineIdNum
                  : masterCuisineId,
                master_cuisine_id: Number.isFinite(masterCuisineIdNum)
                  ? masterCuisineIdNum
                  : undefined,
                masterCuisine: Number.isFinite(masterCuisineIdNum)
                  ? masterCuisineIdNum
                  : undefined,
              };
              // helpful debug while backend is being tested
              // eslint-disable-next-line no-console
              console.debug("Creating cuisine", payload);
              await createCuisine(payload);
            } catch (err) {
              errorMessages.push("Error saving one of the cuisine selections");
            }
          }
        }
      } catch (err) {
        allSuccess = false;
        errorMessages.push("Error saving restaurant basic details");
      }

      // Restaurant Schedules (bulk) -> replace legacy /schedules/ endpoint
      try {
        if (restaurantId) {
          // Collect selected days as numeric codes 1=Mon .. 7=Sun
          const dayNumberMap: Record<string, number> = {
            monday: 1,
            tuesday: 2,
            wednesday: 3,
            thursday: 4,
            friday: 5,
            saturday: 6,
            sunday: 7,
          };
          const selectedDayNumbers = Object.entries(
            scheduleData.operationalDays
          )
            .filter(([_, v]) => v)
            .map(([k]) => dayNumberMap[k]);

          if (selectedDayNumbers.length) {
            // Ensure we have required time fields
            const startTime = scheduleData.startTime || "09:00";
            const endTime = scheduleData.endTime || "18:00";
            const lastOrderTime = scheduleData.lastOrderTime || "17:30";

            // Send as single object matching the example format exactly
            const bulkPayload = {
              restaurant: restaurantId,
              days: selectedDayNumbers,
              operational: true,
              start_time: startTime,
              end_time: endTime,
              break_start_time: scheduleData.bookingStartTime || null,
              break_end_time: scheduleData.bookingEndTime || null,
              booking_allowed: scheduleData.bookingAllowed,
              order_allowed: scheduleData.orderAllowed,
              last_order_time: lastOrderTime,
            };

            console.log("Sending bulk payload:", bulkPayload); // Debug log
            const createdBulk = await createRestaurantSchedulesBulk(
              bulkPayload
            );
            // Handle response - could be single object or array
            if (Array.isArray(createdBulk) && createdBulk.length) {
              scheduleId = createdBulk[0]?.id || null;
            } else if ((createdBulk as any)?.id) {
              scheduleId = (createdBulk as any).id;
            } else {
              console.log("Created bulk response:", createdBulk);
            }
          }
        }
      } catch (err) {
        allSuccess = false;
        errorMessages.push("Error saving restaurant schedules (bulk)");
      }

      // Blocked days
      try {
        // Model expects separate entries with block_type and schedule reference
        if (scheduleId) {
          const blockedPromises: Promise<any>[] = [];
          if (blockedDaysData.orderBlocked) {
            blockedPromises.push(
              createBlockedDay({
                restaurant: scheduleId,
                block_type: "order",
                start_date: blockedDaysData.startDate || null,
                end_date: blockedDaysData.endDate || null,
              })
            );
          }
          if (blockedDaysData.bookingBlocked) {
            blockedPromises.push(
              createBlockedDay({
                restaurant: scheduleId,
                block_type: "booking",
                start_date: blockedDaysData.startDate || null,
                end_date: blockedDaysData.endDate || null,
              })
            );
          }
          if (blockedPromises.length) await Promise.all(blockedPromises);
        }
      } catch (err) {
        allSuccess = false;
        errorMessages.push("Error saving blocked days");
      }

      // Table bookings
      try {
        if (restaurantId) {
          const toTime = (raw: string): string | null => {
            if (!raw) return null;
            const trimmed = raw.trim();
            // Only digits -> treat as total minutes (support >59)
            if (/^\d+$/.test(trimmed)) {
              let total = parseInt(trimmed, 10);
              if (!Number.isFinite(total) || total < 0) return null;
              const hours = Math.floor(total / 60);
              const mins = total % 60;
              const hh = String(hours).padStart(2, "0");
              const mm = String(mins).padStart(2, "0");
              return `${hh}:${mm}:00`;
            }
            // Compact HHMM (e.g. 1305 -> 13:05)
            if (/^\d{3,4}$/.test(trimmed)) {
              const len = trimmed.length;
              const hh = trimmed.slice(0, len - 2);
              const mm = trimmed.slice(len - 2);
              if (parseInt(mm, 10) > 59) return null;
              return `${hh.padStart(2, "0")}:${mm}:00`;
            }
            // HH:MM
            if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
              const [h, m] = trimmed.split(":");
              if (parseInt(m, 10) > 59) return null;
              return `${h.padStart(2, "0")}:${m}:00`;
            }
            // HH:MM:SS
            if (/^\d{1,2}:\d{2}:\d{2}$/.test(trimmed)) {
              const parts = trimmed.split(":");
              if (parseInt(parts[1], 10) > 59 || parseInt(parts[2], 10) > 59)
                return null;
              return (
                parts[0].padStart(2, "0") + ":" + parts[1] + ":" + parts[2]
              );
            }
            return null;
          };
          const toNum = (v: string, def: number) => {
            const p = parseInt(v, 10);
            return Number.isFinite(p) ? p : def;
          };
          const minP = toNum(tableBookingsData.minimumPerson, 1);
          let maxP = toNum(tableBookingsData.maximumPerson, minP);
          if (maxP < minP) maxP = minP;
          const tablePayload: any = {
            restaurant: restaurantId,
            no_of_tables: toNum(tableBookingsData.numberOfTables, 0),
            min_people: minP,
            max_people: maxP,
            can_cancel_before: toTime(tableBookingsData.canCancelBefore),
            booking_not_available_text:
              tableBookingsData.bookingNotAvailableText || "",
            no_of_floors: toNum(tableBookingsData.noOfFloors, 1),
          };
          // Debug log for inspection
          // eslint-disable-next-line no-console
          console.log("TableBooking payload", tablePayload, {
            rawCanCancel: tableBookingsData.canCancelBefore,
            converted: toTime(tableBookingsData.canCancelBefore),
          });
          await createTableBooking(tablePayload);
        }
      } catch (err) {
        allSuccess = false;
        // Try to surface backend error details if present
        const detail =
          (err as any)?.detail || (err as any)?.message || JSON.stringify(err);
        errorMessages.push("Error saving table bookings: " + detail);
      }

      // Order config
      try {
        if (restaurantId) {
          const orderCfg: any = {
            restaurant: restaurantId,
            GST_percentage: orderConfigData.gstPercentage
              ? parseFloat(orderConfigData.gstPercentage)
              : 0,
            delivery_charge: orderConfigData.deliveryCharge
              ? parseFloat(orderConfigData.deliveryCharge)
              : 0,
            service_charge: orderConfigData.serviceChargePercentage
              ? parseFloat(orderConfigData.serviceChargePercentage)
              : 0,
            minimum_order: orderConfigData.minimumOrder
              ? parseInt(orderConfigData.minimumOrder)
              : 0,
            order_not_available_text: orderConfigData.orderNotAllowedText || "",
          };
          await createOrderConfig(orderCfg);
        }
      } catch (err) {
        allSuccess = false;
        errorMessages.push("Error saving order configure");
      }

      // Images and files (only if provided)
      if (coverImageData.coverImage) {
        try {
          const fd = new FormData();
          if (restaurantId) fd.append("restaurant", String(restaurantId));
          fd.append("image", coverImageData.coverImage);
          await uploadCoverImage(fd); // endpoint posts formdata
        } catch (err) {
          allSuccess = false;
          errorMessages.push("Error uploading cover image");
        }
      }

      if (menuImageData.menuImages.length > 0) {
        try {
          const fd = new FormData();
          if (restaurantId) fd.append("restaurant", String(restaurantId));
          menuImageData.menuImages.forEach((file) => fd.append("image", file));
          await uploadMenuImage(fd);
        } catch (err) {
          allSuccess = false;
          errorMessages.push("Error uploading menu images");
        }
      }

      if (galleryImageData.galleryImages.length > 0) {
        try {
          const fd = new FormData();
          galleryImageData.galleryImages.forEach((file) => {
            fd.append("image", file);
          });
          if (restaurantId) fd.append("restaurant", String(restaurantId));
          await uploadGalleryImage(fd);
        } catch (err) {
          allSuccess = false;
          errorMessages.push("Error uploading gallery images");
        }
      }

      if (otherFilesData.otherFiles.length > 0) {
        try {
          const fd = new FormData();
          otherFilesData.otherFiles.forEach((file) => {
            fd.append("file", file);
          });
          if (restaurantId) fd.append("restaurant", String(restaurantId));
          await uploadOtherFile(fd);
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

  // orderData removed; table now powered by restaurants from API.

  // Restaurants fetched from API for listing
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [restaurantsError, setRestaurantsError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (showAddForm) return; // skip while form open
    const load = async () => {
      setLoadingRestaurants(true);
      setRestaurantsError(null);
      try {
        const data = await listRestaurants();
        setRestaurants(Array.isArray(data) ? data : []);
      } catch (e) {
        setRestaurantsError("Failed to load restaurants");
      } finally {
        setLoadingRestaurants(false);
      }
    };
    load();
  }, [showAddForm]);

  const toast = useToast();
  const handleDeleteRestaurant = (id?: number) => {
    if (!id) return;
    toast.confirm({
      title: "Confirm Delete",
      message: "Are you sure you want to delete this restaurant?",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        setDeletingIds((prev) => new Set(prev).add(id));
        try {
          await deleteRestaurant(id);
          setRestaurants((prev) => prev.filter((r) => r.id !== id));
          toast.success("Restaurant deleted");
        } catch {
          toast.error("Failed to delete");
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

  // Helper to format dates (Created on column)
  const formatDateTime = (iso?: string): string => {
    if (!iso) return "-";
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "-";
      // Format: DD-MM-YYYY HH:MM
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${pad(d.getDate())}-${pad(
        d.getMonth() + 1
      )}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return "-";
    }
  };

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

  // Resolve created date and creator name (some APIs may nest or use different keys)
  const resolveCreatedOn = (r: any): string =>
    formatDateTime(r?.created_at || r?.createdAt || r?.created || r?.timestamp);
  const resolveCreatedBy = (r: any): string =>
    r?.created_by_name ||
    r?.created_by ||
    r?.owner_name ||
    r?.owner ||
    r?.user ||
    "-";

  // Status icon components
  const StatusActiveIcon = () => (
    <div
      style={{
        display: "inline-block",
        width: 40,
        height: 20,
        backgroundColor: "#4CAF50",
        borderRadius: 10,
        position: "relative",
        cursor: "pointer",
      }}
      title="Active"
    >
      <div
        style={{
          width: 16,
          height: 16,
          backgroundColor: "white",
          borderRadius: "50%",
          position: "absolute",
          top: 2,
          right: 2,
          transition: "all 0.3s ease",
        }}
      />
    </div>
  );
  const StatusInactiveIcon = () => (
    <div
      style={{
        display: "inline-block",
        width: 40,
        height: 20,
        backgroundColor: "#f44336",
        borderRadius: 10,
        position: "relative",
        cursor: "pointer",
      }}
      title="Inactive"
    >
      <div
        style={{
          width: 16,
          height: 16,
          backgroundColor: "white",
          borderRadius: "50%",
          position: "absolute",
          top: 2,
          left: 2,
          transition: "all 0.3s ease",
        }}
      />
    </div>
  );

  // Lightweight dropdown multi-select for cuisines (compact UI)
  const MultiCuisineSelect = ({
    options,
    value,
    onChange,
  }: {
    options: Cuisine[];
    value: string[];
    onChange: (v: string[]) => void;
  }) => {
    const [openState, setOpenState] = useState(false);
    const root = useRef<HTMLDivElement | null>(null);

    const openPanel = () => setOpenState(true);
    const closePanel = () => setOpenState(false);

    const handleToggleSelection = (val: string) => {
      const next = new Set(value || []);
      if (next.has(val)) next.delete(val);
      else next.add(val);
      onChange(Array.from(next));
      // ensure panel remains open while selecting
      setOpenState(true);
    };

    const labelsArr = (value || [])
      .map((id) => {
        const found = options.find(
          (o) =>
            String(o.id) === String(id) ||
            String(o._id) === String(id) ||
            String(o.name) === String(id)
        );
        return found
          ? found.name || found.title || String(found.id ?? found._id)
          : String(id);
      })
      .filter(Boolean) as string[];

    return (
      <div
        ref={root}
        style={{ position: "relative", display: "inline-block", width: "100%" }}
      >
        <button
          type="button"
          onClick={openPanel}
          aria-haspopup="listbox"
          aria-expanded={openState}
          style={{
            width: "100%",
            textAlign: "left",
            padding: "10px 12px",
            border: "1px solid #d0d7de",
            borderRadius: 6,
            background: "#fff",
            cursor: "pointer",
            height: 40,
            display: "flex",
            alignItems: "center",
            gap: 8,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            boxSizing: "border-box",
          }}
        >
          <span
            style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}
          >
            {labelsArr.length === 0
              ? "Select cuisine"
              : labelsArr.length <= 2
              ? labelsArr.join(", ")
              : `${labelsArr.length} selected`}
          </span>
          <span style={{ color: "#666", fontSize: 12 }}>
            {openState ? "▲" : "▼"}
          </span>
        </button>

        {openState && (
          <div
            role="listbox"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              background: "#fff",
              border: "1px solid rgba(0,0,0,0.12)",
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
              borderRadius: 8,
              maxHeight: 240,
              overflowY: "auto",
              zIndex: 1200,
              padding: 6,
            }}
          >
            {options && options.length > 0 ? (
              options.map((o) => {
                const id = String(o.id ?? o._id ?? o.name ?? "");
                const checked = (value || []).some((v) => String(v) === id);
                return (
                  <label
                    key={id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                    onPointerDown={(ev) => ev.preventDefault()} // prevent blur/focus change
                    onClick={(ev) => ev.stopPropagation()} // prevent outer handlers
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onPointerDown={(ev) => {
                        ev.preventDefault();
                        ev.stopPropagation();
                        handleToggleSelection(id);
                      }}
                      onClick={(ev) => ev.stopPropagation()}
                      style={{ width: 16, height: 16 }}
                    />
                    <span style={{ userSelect: "none" }}>{o.name}</span>
                  </label>
                );
              })
            ) : (
              <div style={{ padding: 8, color: "#666" }}>No cuisines</div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: 8,
              }}
            >
              <button
                type="button"
                onClick={closePanel}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #d0d7de",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const toggleStatus = async (r: any) => {
    if (typeof r?.id === "undefined") return;
    const current = !!(typeof r.active === "boolean"
      ? r.active
      : r.status === "Active");
    const next = !current;
    // optimistic UI
    setRestaurants((prev) =>
      prev.map((x) => (x.id === r.id ? { ...x, active: next } : x))
    );
    try {
      // build compatibility payload: boolean, numeric and status string variants
      const payload: any = {
        active: next,
        is_active: next,
        status: next ? "Active" : "Inactive",
      };
      // add numeric flag if backend expects ints
      payload.is_active_int = next ? 1 : 0;

      const res = await patchRestaurant(r.id, payload);

      // merge server response into local state if available, otherwise set active flag
      setRestaurants((prev) =>
        prev.map((x) =>
          x.id === r.id ? { ...x, ...(res || {}), active: next } : x
        )
      );

      toast.success(`Status set to ${next ? "Active" : "Inactive"}`);
    } catch (e) {
      // revert
      setRestaurants((prev) =>
        prev.map((x) => (x.id === r.id ? { ...x, active: current } : x))
      );
      toast.error("Failed to update status");
    }
  };

  // Show Viewrestaurant component if viewing a restaurant
  if (viewingRestaurantId) {
    return (
      <Viewrestaurant
        id={viewingRestaurantId}
        onBack={() => setViewingRestaurantId(null)}
      />
    );
  }

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
                      <input
                        type="text"
                        name="costForTwo"
                        value={formData.costForTwo}
                        onChange={handleInputChange}
                        placeholder="Cost For Two"
                      />
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
                      {phoneErrors.mobileNumber && (
                        <div style={{ color: "red", fontSize: 12 }}>
                          {phoneErrors.mobileNumber}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Another Mobile Number*</label>
                      <input
                        type="text"
                        name="alternativeNumber"
                        value={formData.alternativeNumber}
                        onChange={handleInputChange}
                        placeholder="Enter Number"
                      />
                      {phoneErrors.alternativeNumber && (
                        <div style={{ color: "red", fontSize: 12 }}>
                          {phoneErrors.alternativeNumber}
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Landline Number</label>
                      <input
                        type="text"
                        name="landlineNumber"
                        value={formData.landlineNumber}
                        onChange={handleInputChange}
                        placeholder="Enter Number"
                      />
                    </div>
                    <div className="form-group">
                      <label>Delivery Time</label>
                      <input
                        type="text"
                        name="deliveryTime"
                        value={formData.deliveryTime}
                        onChange={handleInputChange}
                        placeholder="e.g. 30 mins"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Cuisines</label>
                      <MultiCuisineSelect
                        options={cuisines}
                        value={
                          Array.isArray(formData.cuisines)
                            ? formData.cuisines
                            : []
                        }
                        onChange={(arr) =>
                          setFormData((p) => ({ ...p, cuisines: arr }))
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Drink Alcohol*</label>
                      <select
                        name="drinkAlcohol"
                        value={formData.drinkAlcohol}
                        onChange={handleInputChange}
                      >
                        <option value="">Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Wheelchair Accessible*</label>
                      <select
                        name="wheelchairAccessible"
                        value={formData.wheelchairAccessible}
                        onChange={handleInputChange}
                      >
                        <option value="">Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Cash On Delivery*</label>
                      <select
                        name="cashOnDelivery"
                        value={formData.cashOnDelivery}
                        onChange={handleInputChange}
                      >
                        <option value="">Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Pure Veg*</label>
                      <select
                        name="pureVeg"
                        value={formData.pureVeg}
                        onChange={handleInputChange}
                      >
                        <option value="">Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
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
                      <textarea
                        rows={3}
                        name="termsAndConditions"
                        value={formData.termsAndConditions}
                        onChange={handleInputChange}
                        placeholder="Enter terms..."
                      ></textarea>
                    </div>
                    <div className="form-group">
                      <label>Disclaimer</label>
                      <textarea
                        rows={3}
                        name="disclaimer"
                        value={formData.disclaimer}
                        onChange={handleInputChange}
                        placeholder="Enter disclaimer..."
                      ></textarea>
                    </div>
                    <div className="form-group">
                      <label>Closing Message</label>
                      <textarea
                        rows={3}
                        name="closingMessage"
                        value={formData.closingMessage}
                        onChange={handleInputChange}
                        placeholder="Enter closing message..."
                      ></textarea>
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
                        {(() => {
                          const days = [
                            { key: "monday", label: "M" },
                            { key: "tuesday", label: "T" },
                            { key: "wednesday", label: "W" },
                            { key: "thursday", label: "T" },
                            { key: "friday", label: "F" },
                            { key: "saturday", label: "S" },
                            { key: "sunday", label: "S" },
                          ];
                          const allSelected = days.every(
                            (d) => (scheduleData.operationalDays as any)[d.key]
                          );
                          return (
                            <>
                              <label className="checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={allSelected}
                                  onChange={() => {
                                    setScheduleData((prev) => {
                                      const newVal = !days.every(
                                        (d) =>
                                          (prev.operationalDays as any)[d.key]
                                      );
                                      const updated: typeof prev.operationalDays =
                                        {
                                          ...prev.operationalDays,
                                        } as any;
                                      days.forEach((d) => {
                                        (updated as any)[d.key] = newVal;
                                      });
                                      return {
                                        ...prev,
                                        operationalDays: updated,
                                      };
                                    });
                                  }}
                                />{" "}
                                All
                              </label>
                              {days.map((d) => (
                                <label key={d.key} className="checkbox-label">
                                  <input
                                    type="checkbox"
                                    name={`day_${d.key}`}
                                    checked={
                                      (scheduleData.operationalDays as any)[
                                        d.key
                                      ]
                                    }
                                    onChange={handleScheduleChange}
                                  />{" "}
                                  {d.label}
                                </label>
                              ))}
                            </>
                          );
                        })()}
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
                      <div className="time-fields">
                        <div className="form-group">
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
                        placeholder="e.g. 15 or 00:15 or 00:15:00"
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
                          multiple
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
                            {menuImageData.menuImages.length > 0
                              ? `${menuImageData.menuImages.length} file(s) selected`
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
          {loadingRestaurants
            ? "Loading..."
            : restaurants.length > 0
            ? `1-${restaurants.length} of ${restaurants.length}`
            : "0-0 of 0"}
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
              <th>Action</th>
              {/* <th>Order ID</th> */}
              <th>Restaurant</th>
              <th>Created on</th>
              <th>Created By</th>
              {/* <th>Flat</th> */}
              <th>Status</th>
              {/* <th>Amount Paid</th> */}
              {/* <th>No. Of Items</th> */}
              {/* <th>Payment Status</th> */}
              {/* <th>Additional Request</th> */}
            </tr>
          </thead>
          <tbody>
            {loadingRestaurants && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center" }}>
                  Loading...
                </td>
              </tr>
            )}
            {restaurantsError && !loadingRestaurants && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", color: "red" }}>
                  {restaurantsError}
                </td>
              </tr>
            )}
            {!loadingRestaurants &&
              !restaurantsError &&
              restaurants.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center" }}>
                    No restaurants
                  </td>
                </tr>
              )}
            {restaurants.map((r: any) => {
              const name = r.restaurant_name || r.name || `Restaurant ${r.id}`;
              const isActive =
                typeof r.active === "boolean"
                  ? r.active
                  : r.status === "Active" || r.status === "active";
              return (
                <tr key={r.id || name}>
                  <td>
                    <div
                      className="action-icon"
                      style={{ display: "flex", gap: 6 }}
                    >
                      <button
                        className="action-btn edit-btn"
                        title="Edit"
                        onClick={() => toast.info(`Edit ${name} coming soon`)}
                      >
                        <EditIcon />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        title="Delete"
                        onClick={() => handleDeleteRestaurant(r.id)}
                        disabled={deletingIds.has(r.id)}
                        style={
                          deletingIds.has(r.id)
                            ? { opacity: 0.5, cursor: "not-allowed" }
                            : undefined
                        }
                      >
                        {deletingIds.has(r.id) ? "..." : <DeleteIcon />}
                      </button>
                      <button
                        className="action-btn view-btn"
                        title="View"
                        onClick={() => setViewingRestaurantId(r.id)}
                      >
                        <ViewIcon />
                      </button>
                    </div>
                  </td>
                  <td>{name}</td>
                  <td>{resolveCreatedOn(r)}</td>
                  <td>{resolveCreatedBy(r)}</td>
                  <td>
                    <button
                      onClick={() => toggleStatus(r)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                      title={isActive ? "Deactivate" : "Activate"}
                    >
                      {isActive ? <StatusActiveIcon /> : <StatusInactiveIcon />}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
