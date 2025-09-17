// Endpoint helper functions for Food & Beverages domain
// Uses centralized axios instances from axiosInstance.ts

import { FandBInstance, unwrapList } from "./axiosInstance";
import axios from "axios";

// Generic listing helper (auto unwrap results or array)
async function list<T = any>(
  url: string,
  params?: Record<string, any>
): Promise<T[]> {
  const { data } = await FandBInstance.get(url, { params });
  return unwrapList<T>(data);
}

// Generic detail fetch
async function retrieve<T = any>(url: string): Promise<T> {
  const { data } = await FandBInstance.get(url);
  return data as T;
}

// Generic create/update/delete
async function create<T = any>(
  url: string,
  payload: any,
  config?: any
): Promise<T> {
  try {
    const { data } = await FandBInstance.post(url, payload, config);
    return data as T;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      // eslint-disable-next-line no-console
      console.error(
        "API CREATE ERROR",
        url,
        err.response?.status,
        err.response?.data
      );
      throw (
        err.response?.data || {
          status: err.response?.status,
          error: "Unknown error",
        }
      );
    }
    throw err;
  }
}
async function update<T = any>(
  url: string,
  payload: any,
  method: "put" | "patch" = "put"
): Promise<T> {
  const { data } = await FandBInstance[method](url, payload);
  return data as T;
}
async function destroy(url: string): Promise<void> {
  await FandBInstance.delete(url);
}

// ---- Restaurants ----
export const listRestaurants = (params?: any) => list("/restaurants/", params);
export const retrieveRestaurant = (id: number) =>
  retrieve(`/restaurants/${id}/`);
export const createRestaurant = (payload: any) =>
  create("/restaurants/", payload);
export const updateRestaurant = (id: number, payload: any) =>
  update(`/restaurants/${id}/`, payload);
// Partial update helper (PATCH) — use this for single-field updates like `is_active`
export const patchRestaurant = (id: number, payload: any) =>
  update(`/restaurants/${id}/`, payload, "patch");
export const deleteRestaurant = (id: number) => destroy(`/restaurants/${id}/`);

// ---- (Deprecated) Schedules ----
// Legacy endpoints replaced by /restaurant-schedules/ & /restaurant-schedules/bulk/
// Keeping commented for reference; remove completely when backend fully decommissions.
// export const listSchedules = (params?: any) => list("/schedules/", params);
// export const createSchedule = (payload: any) => create("/schedules/", payload);
// export const updateSchedule = (id: number, payload: any) => update(`/schedules/${id}/`, payload);
// export const deleteSchedule = (id: number) => destroy(`/schedules/${id}/`);

// ---- Restaurant Schedules ----
export const listRestaurantSchedules = (params?: any) =>
  list("/restaurant-schedules/", params);
export const updateRestaurantSchedule = (id: number, payload: any) =>
  update(`/restaurant-schedules/${id}/`, payload, "patch");
export const createRestaurantSchedulesBulk = (payload: any) =>
  create("/restaurant-schedules/bulk/", payload);

// ---- Blocked Days ----
export const listBlockedDays = (params?: any) => list("/blocked-days/", params);
export const createBlockedDay = (payload: any) =>
  create("/blocked-days/", payload);
export const deleteBlockedDay = (id: number) => destroy(`/blocked-days/${id}/`);

// ---- Table Bookings ----
export const listTableBookings = (params?: any) =>
  list("/table-bookings/", params);
export const createTableBooking = (payload: any) =>
  create("/table-bookings/", payload);
export const updateTableBooking = (id: number, payload: any) =>
  update(`/table-bookings/${id}/`, payload);
export const deleteTableBooking = (id: number) =>
  destroy(`/table-bookings/${id}/`);

// ---- Order Configs ----
export const listOrderConfigs = () => list("/order-configs/");
export const createOrderConfig = (payload: any) =>
  create("/order-configs/", payload);
export const updateOrderConfig = (id: number, payload: any) =>
  update(`/order-configs/${id}/`, payload, "patch");

// ---- Cuisines ----
export const listCuisines = (params?: any) => list("/cuisines/", params);
export const listMasterCuisines = (params?: any) =>
  list("/master-cuisines/", params);
export const createCuisine = (payload: any) => create("/cuisines/", payload);
export const updateCuisine = (id: number, payload: any) =>
  update(`/cuisines/${id}/`, payload);
export const deleteCuisine = (id: number) => destroy(`/cuisines/${id}/`);

// ---- Categories ----
export const listCategories = (params?: any) => list("/categories/", params);
export const createCategory = (payload: any) => create("/categories/", payload);
export const updateCategory = (id: number, payload: any) =>
  update(`/categories/${id}/`, payload);
export const deleteCategory = (id: number) => destroy(`/categories/${id}/`);

// ---- Items ----
export const listItems = (params?: any) => list("/items/", params);
export const retrieveItem = (id: number) => retrieve(`/items/${id}/`);
export const createItem = (payload: any) => create("/items/", payload);
export const updateItem = (id: number, payload: any) =>
  update(`/items/${id}/`, payload);
// Partial update helper (PATCH) — use this for single-field updates like `status` or `is_active`
export const patchItem = (id: number, payload: any) =>
  update(`/items/${id}/`, payload, "patch");
export const deleteItem = (id: number) => destroy(`/items/${id}/`);

// ---- Customers ----
export const listCustomers = (params?: any) => list("/customers/", params);
export const createCustomer = (payload: any) => create("/customers/", payload);
export const updateCustomer = (id: number, payload: any) =>
  update(`/customers/${id}/`, payload);
export const deleteCustomer = (id: number) => destroy(`/customers/${id}/`);

// ---- Orders ----
export const listOrders = (params?: any) => list("/orders/", params);
export const retrieveOrder = (id: number) => retrieve(`/orders/${id}/`);
export const createOrder = (payload: any) => create("/orders/", payload);
export const updateOrder = (id: number, payload: any) =>
  update(`/orders/${id}/`, payload, "patch");
export const deleteOrder = (id: number) => destroy(`/orders/${id}/`);

// ---- Suppliers ----
export const listSuppliers = (params?: any) => list("/suppliers/", params);
export const createSupplier = (payload: any) => create("/suppliers/", payload);
export const updateSupplier = (id: number, payload: any) =>
  update(`/suppliers/${id}/`, payload);
export const deleteSupplier = (id: number) => destroy(`/suppliers/${id}/`);

// ---- Warehouses ----
export const listWarehouses = (params?: any) => list("/warehouses/", params);
export const createWarehouse = (payload: any) =>
  create("/warehouses/", payload);
export const updateWarehouse = (id: number, payload: any) =>
  update(`/warehouses/${id}/`, payload);
export const deleteWarehouse = (id: number) => destroy(`/warehouses/${id}/`);

// ---- Inventory Items ----
export const listInventoryItems = (params?: any) =>
  list("/inventory-items/", params);
export const createInventoryItem = (payload: any) =>
  create("/inventory-items/", payload);
export const updateInventoryItem = (id: number, payload: any) =>
  update(`/inventory-items/${id}/`, payload);
export const deleteInventoryItem = (id: number) =>
  destroy(`/inventory-items/${id}/`);

// ---- Inventory Movements ----
export const listInventoryMovements = (params?: any) =>
  list("/inventory-movements/", params);
export const createInventoryMovement = (payload: any) =>
  create("/inventory-movements/", payload);

// ---- Ingredients ----
export const listIngredients = (params?: any) => list("/ingredients/", params);
export const createIngredient = (payload: any) =>
  create("/ingredients/", payload);
export const updateIngredient = (id: number, payload: any) =>
  update(`/ingredients/${id}/`, payload);
export const deleteIngredient = (id: number) => destroy(`/ingredients/${id}/`);

// ---- Item Ingredients ----
export const listItemIngredients = (params?: any) =>
  list("/item-ingredients/", params);
export const createItemIngredient = (payload: any) =>
  create("/item-ingredients/", payload);
export const updateItemIngredient = (id: number, payload: any) =>
  update(`/item-ingredients/${id}/`, payload);
export const deleteItemIngredient = (id: number) =>
  destroy(`/item-ingredients/${id}/`);

// ---- Cover Images ----
export const uploadCoverImage = (form: FormData) =>
  create("/cover-images/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteCoverImage = (id: number) => destroy(`/cover-images/${id}/`);

// ---- Menu Images ----
export const listMenuImages = (params?: any) => list("/menu-images/", params);
export const uploadMenuImage = (form: FormData) =>
  create("/menu-images/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteMenuImage = (id: number) => destroy(`/menu-images/${id}/`);

// ---- Gallery Images ----
export const listGalleryImages = (params?: any) =>
  list("/gallery-images/", params);
export const uploadGalleryImage = (form: FormData) =>
  create("/gallery-images/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteGalleryImage = (id: number) =>
  destroy(`/gallery-images/${id}/`);

// ---- Other Files ----
export const uploadOtherFile = (form: FormData) =>
  create("/other-files/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteOtherFile = (id: number) => destroy(`/other-files/${id}/`);

// ---- Aggregated export (optional) ----
export const FNBEndpoints = {
  listCuisines,
  createCuisine,
  updateCuisine,
  deleteCuisine,
  listRestaurants,
  retrieveRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  listRestaurantSchedules,
  updateRestaurantSchedule,
  createRestaurantSchedulesBulk,
  listBlockedDays,
  createBlockedDay,
  deleteBlockedDay,
  listTableBookings,
  createTableBooking,
  updateTableBooking,
  deleteTableBooking,
  listOrderConfigs,
  createOrderConfig,
  updateOrderConfig,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listItems,
  retrieveItem,
  createItem,
  updateItem,
  deleteItem,
  listCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  listOrders,
  retrieveOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  listSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  listWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  listInventoryItems,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  listInventoryMovements,
  createInventoryMovement,
  listIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  listItemIngredients,
  createItemIngredient,
  updateItemIngredient,
  deleteItemIngredient,
  uploadCoverImage,
  deleteCoverImage,
  uploadMenuImage,
  deleteMenuImage,
  listGalleryImages,
  uploadGalleryImage,
  deleteGalleryImage,
  uploadOtherFile,
  deleteOtherFile,
};

export default FNBEndpoints;
