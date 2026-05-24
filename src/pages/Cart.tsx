import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CartItemCard, { type CartItem } from "../components/CartItemCard";
import apiClient from "../lib/api-client";
import { ToastHelper } from "../lib/toast-helper";

interface CartResponse {
  cart: {
    id: number;
    items: CartItem[];
  };
}

function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingProductId, setUpdatingProductId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        return sum + Number(item.product.price) * item.quantity;
      }, 0),
    [items],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadCart() {
      try {
        const response = await apiClient.get<CartResponse>("/cart");

        if (!isMounted) {
          return;
        }

        setItems(response.data.cart.items);
        setError(null);
      } catch {
        if (isMounted) {
          setError("Chua the tai gio hang.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadCart();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateQuantity = async (item: CartItem, quantity: number) => {
    setUpdatingProductId(item.productId);

    try {
      const response = await apiClient.patch<CartResponse>(`/cart/items/${item.productId}`, {
        quantity,
      });
      setItems(response.data.cart.items);
    } catch {
      ToastHelper.error("Cap nhat gio hang that bai");
    } finally {
      setUpdatingProductId(null);
    }
  };

  const removeItem = async (item: CartItem) => {
    setUpdatingProductId(item.productId);

    try {
      const response = await apiClient.delete<CartResponse>(`/cart/items/${item.productId}`);
      setItems(response.data.cart.items);
    } catch {
      ToastHelper.error("Xoa san pham that bai");
    } finally {
      setUpdatingProductId(null);
    }
  };

  const handleIncrease = (item: CartItem) => {
    updateQuantity(item, item.quantity + 1);
  };

  const handleDecrease = (item: CartItem) => {
    if (item.quantity <= 1) {
      removeItem(item);
      return;
    }

    updateQuantity(item, item.quantity - 1);
  };

  return (
    <section className="py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-normal text-slate-950">Gio hang</h1>
        <p className="mt-2 text-sm text-slate-600">
          Kiem tra san pham va so luong truoc khi thanh toan.
        </p>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Dang tai gio hang...</p>}

      {!isLoading && error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!isLoading && !error && items.length === 0 && (
        <div className="rounded-md border border-slate-200 px-4 py-8 text-center">
          <p className="text-sm text-slate-600">Gio hang dang trong.</p>
          <Link
            to="/catalog"
            className="mt-4 inline-flex h-10 items-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Xem san pham
          </Link>
        </div>
      )}

      {items.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {items.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                isUpdating={updatingProductId === item.productId}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                onRemove={removeItem}
              />
            ))}
          </div>

          <aside className="h-fit rounded-md border border-slate-200 bg-white p-4">
            <h2 className="text-base font-semibold text-slate-950">Tong ket</h2>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-600">Tam tinh</span>
              <span className="font-semibold text-slate-950">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                  maximumFractionDigits: 0,
                }).format(subtotal)}
              </span>
            </div>
            <Link
              to="/checkout"
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              Chuyen sang Checkout
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
}

export default Cart;
