const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export { API_URL };

// Food/category imageUrl fields store a relative path like
// "/uploads/xyz.jpg" — this turns that into a full URL pointing at the
// backend, since images are served from there, not from the Next.js app.
export function resolveImageUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_URL}${path}`;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json() : null;

  if (!res.ok) {
    // Nest's ValidationPipe returns `message` as either a string or an
    // array of validation error strings — normalize both to one string.
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : body?.message ?? "Something went wrong. Please try again.";

    throw new ApiError(message, res.status);
  }

  return body as T;
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: "CUSTOMER" | "ADMIN" | "KITCHEN" | "DELIVERY";
  isVerified: boolean;
  isActive: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
  message?: string;
}

export function loginRequest(payload: { email: string; password: string }) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function registerRequest(payload: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateProfile(
  token: string,
  payload: { fullName?: string; email?: string; phone?: string },
) {
  return request<AuthUser>("/users/me", {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function changePassword(
  token: string,
  payload: { currentPassword: string; newPassword: string },
) {
  return request<{ message: string }>("/users/me/password", {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

// ---- Menu ----

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface Food {
  id: string;
  name: string;
  description?: string;
  price: string; // Postgres `decimal` comes back as a string over JSON
  imageUrl?: string;
  isVeg: boolean;
  isAvailable: boolean;
  stockQuantity: number;
  preparationTime: number;
  category: Category;
  categoryId: string;
}

export function getCategories() {
  return request<Category[]>("/categories");
}

export function getFoods() {
  return request<Food[]>("/foods");
}

// ---- Cart ----

export interface CartItemDto {
  id: string;
  food: Food;
  quantity: number;
}

export interface CartDto {
  id: string;
  items: CartItemDto[];
}

export function getCart(token: string) {
  return request<CartDto>("/cart", { headers: authHeaders(token) });
}

export function addCartItem(
  token: string,
  payload: { foodId: string; quantity: number },
) {
  return request<CartDto>("/cart", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function updateCartItem(
  token: string,
  itemId: string,
  quantity: number,
) {
  return request<CartDto>(`/cart/${itemId}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ quantity }),
  });
}

export function removeCartItem(token: string, itemId: string) {
  return request<CartDto>(`/cart/${itemId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export function clearCart(token: string) {
  return request<{ message: string }>("/cart", {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

// ---- Orders ----

export type PaymentMethod = "CASH_ON_DELIVERY" | "CARD" | "UPI";

export interface OrderDto {
  id: string;
  tokenNumber?: string;
  status: string;
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  totalAmount: string;
  deliveryAddress: string;
  transactionRef?: string;
  upiLink?: string | null;
  createdAt: string;
}

export function checkout(
  token: string,
  payload: { deliveryAddress: string; paymentMethod: PaymentMethod },
) {
  return request<OrderDto>("/orders/checkout", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export interface OrderItemDto {
  id: string;
  quantity: number;
  price: string;
  food: Food;
}

export interface OrderWithItemsDto extends OrderDto {
  items: OrderItemDto[];
}

export function getMyOrders(token: string) {
  return request<OrderWithItemsDto[]>("/orders/mine", {
    headers: authHeaders(token),
  });
}

// ---- Admin: orders ----

export interface AdminOrderDto extends OrderWithItemsDto {
  user: { id: string; fullName: string; email: string; phone: string };
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "DELIVERED"
  | "CANCELLED";

export function getAllOrders(token: string) {
  return request<AdminOrderDto[]>("/orders", {
    headers: authHeaders(token),
  });
}

export type OrderPaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export function updateOrder(
  token: string,
  orderId: string,
  payload: { status?: OrderStatus; paymentStatus?: OrderPaymentStatus },
) {
  return request<AdminOrderDto>(`/orders/${orderId}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

// ---- Admin: categories ----

export function createCategory(
  token: string,
  payload: { name: string; description?: string },
) {
  return request<Category>("/categories", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function updateCategory(
  token: string,
  id: string,
  payload: { name?: string; description?: string; isActive?: boolean },
) {
  return request<Category>(`/categories/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function deleteCategory(token: string, id: string) {
  return request<{ message: string }>(`/categories/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

// ---- Admin: foods ----

export interface FoodPayload {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isVeg?: boolean;
  isAvailable?: boolean;
  stockQuantity: number;
  preparationTime?: number;
  categoryId: string;
}

// Separate from `request()` since this sends multipart/form-data, not
// JSON — the browser sets the correct Content-Type boundary itself as
// long as we don't manually set a Content-Type header.
export async function uploadFoodImage(token: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/uploads/image`, {
    method: "POST",
    headers: authHeaders(token),
    body: formData,
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : body?.message ?? "Couldn't upload the image.";
    throw new ApiError(message, res.status);
  }

  return body as { url: string };
}

export function createFood(token: string, payload: FoodPayload) {
  return request<Food>("/foods", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function updateFood(
  token: string,
  id: string,
  payload: Partial<FoodPayload>,
) {
  return request<Food>(`/foods/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function deleteFood(token: string, id: string) {
  return request<{ message: string }>(`/foods/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

// ---- Admin: inventory ----

export type InventoryType = "STOCK_IN" | "STOCK_OUT";

export interface InventoryRecord {
  id: string;
  foodId: string;
  food: Food;
  type: InventoryType;
  quantity: number;
  note: string | null;
  createdAt: string;
}

export function getInventory(token: string) {
  return request<InventoryRecord[]>("/inventory", {
    headers: authHeaders(token),
  });
}

export function adjustInventory(
  token: string,
  payload: {
    foodId: string;
    type: InventoryType;
    quantity: number;
    note?: string;
  },
) {
  return request<InventoryRecord>("/inventory", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}
