import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types';

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  addToCart: (item: CartItem) => void; // Alias for addItem
  removeItem: (productId: string, size: string, color: string) => void;
  removeFromCart: (productId: string) => void;
  updateItem: (productId: string, quantity: number, size: string, color: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  loadCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  totalItems: number;
  totalPrice: number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,

      addItem: (newItem: CartItem) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) =>
              item.productId === newItem.productId &&
              item.size === newItem.size &&
              item.color === newItem.color
          );

          let updatedItems;
          if (existingItemIndex > -1) {
            updatedItems = [...state.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + newItem.quantity
            };
          } else {
            updatedItems = [...state.items, newItem];
          }

          const totalItems = updatedItems.reduce((total, item) => total + item.quantity, 0);
          const totalPrice = updatedItems.reduce((total, item) => total + item.price * item.quantity, 0);

          return { items: updatedItems, totalItems, totalPrice };
        });
      },

      addToCart: (item: CartItem) => {
        get().addItem(item);
      },

      removeItem: (productId: string, size: string, color: string) => {
        set((state) => {
          const updatedItems = state.items.filter(
            (item) =>
              !(item.productId === productId && item.size === size && item.color === color)
          );

          const totalItems = updatedItems.reduce((total, item) => total + item.quantity, 0);
          const totalPrice = updatedItems.reduce((total, item) => total + item.price * item.quantity, 0);

          return { items: updatedItems, totalItems, totalPrice };
        });
      },

      removeFromCart: (productId: string) => {
        set((state) => {
          const updatedItems = state.items.filter(item => item.productId !== productId);

          const totalItems = updatedItems.reduce((total, item) => total + item.quantity, 0);
          const totalPrice = updatedItems.reduce((total, item) => total + item.price * item.quantity, 0);

          return { items: updatedItems, totalItems, totalPrice };
        });
      },

      updateItem: (productId: string, quantity: number, size: string, color: string) => {
        set((state) => {
          const updatedItems = state.items.map((item) =>
            item.productId === productId && item.size === size && item.color === color
              ? { ...item, quantity }
              : item
          );

          const totalItems = updatedItems.reduce((total, item) => total + item.quantity, 0);
          const totalPrice = updatedItems.reduce((total, item) => total + item.price * item.quantity, 0);

          return { items: updatedItems, totalItems, totalPrice };
        });
      },

      updateQuantity: (productId: string, quantity: number) => {
        set((state) => {
          const updatedItems = state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          );

          const totalItems = updatedItems.reduce((total, item) => total + item.quantity, 0);
          const totalPrice = updatedItems.reduce((total, item) => total + item.price * item.quantity, 0);

          return { items: updatedItems, totalItems, totalPrice };
        });
      },

      clearCart: () => {
        set({ items: [], totalItems: 0, totalPrice: 0 });
      },

      loadCart: () => {
        set((state) => {
          const totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
          const totalPrice = state.items.reduce((total, item) => total + item.price * item.quantity, 0);
          return { totalItems, totalPrice };
        });
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
          const totalPrice = state.items.reduce((total, item) => total + item.price * item.quantity, 0);
          state.totalItems = totalItems;
          state.totalPrice = totalPrice;
        }
      },
    }
  )
); 