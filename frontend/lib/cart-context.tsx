"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./auth-context";
import {
  addCartItem,
  checkout as checkoutRequest,
  clearCart as clearCartRequest,
  getCart,
  removeCartItem,
  updateCartItem,
  type CartDto,
  type OrderDto,
  type PaymentMethod,
} from "./api";

interface CartContextValue {
  cart: CartDto | null;
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
  addToCart: (foodId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  checkout: (payload: {
    deliveryAddress: string;
    paymentMethod: PaymentMethod;
  }) => Promise<OrderDto>;
  clearCart: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [cart, setCart] = useState<CartDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) {
      setCart(null);
      return;
    }
    setIsLoading(true);
    try {
      const next = await getCart(token);
      setCart(next);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // Intentional: fetches the cart from the server whenever the auth
    // token changes (login, logout, or initial load). This is a
    // fetch-on-dependency-change effect, not derived state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  async function addToCart(foodId: string, quantity = 1) {
    if (!token) {
      throw new Error("You need to sign in first.");
    }
    const next = await addCartItem(token, { foodId, quantity });
    setCart(next);
  }

  async function updateQuantity(itemId: string, quantity: number) {
    if (!token) return;
    const next = await updateCartItem(token, itemId, quantity);
    setCart(next);
  }

  async function removeItem(itemId: string) {
    if (!token) return;
    const next = await removeCartItem(token, itemId);
    setCart(next);
  }

  async function checkout(payload: {
    deliveryAddress: string;
    paymentMethod: PaymentMethod;
  }) {
    if (!token) {
      throw new Error("You need to sign in first.");
    }
    const order = await checkoutRequest(token, payload);
    setCart(null);
    await refresh();
    return order;
  }

  async function clearCart() {
    if (!token) return;
    await clearCartRequest(token);
    await refresh();
  }

  const itemCount =
    cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const subtotal =
    cart?.items.reduce(
      (sum, item) => sum + Number(item.food.price) * item.quantity,
      0,
    ) ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        subtotal,
        isLoading,
        addToCart,
        updateQuantity,
        removeItem,
        checkout,
        clearCart,
        refresh,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
