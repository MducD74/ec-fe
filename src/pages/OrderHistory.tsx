import { ChevronDown, PackageSearch, ShoppingBag } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import apiClient from "../lib/api-client";

interface OrderProduct {
  id: number;
  name: string;
  price: string | number;
  imageUrl?: string | null;
}

interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: string | number;
  product: OrderProduct;
}

interface Order {
  id: number;
  total: string | number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED" | string;
  createdAt: string;
  items: OrderItem[];
}

interface OrderHistoryResponse {
  success: boolean;
  data: Order[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
  };
}

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const statusClassByValue: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-100",
  PROCESSING: "bg-blue-50 text-blue-700 ring-blue-100",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  CANCELLED: "bg-red-50 text-primary-700 ring-red-100",
};

function formatCurrency(value: string | number) {
  return currencyFormatter.format(Number(value));
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [completingOrderId, setCompletingOrderId] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 0,
  });

  const hasOrders = useMemo(() => orders.length > 0, [orders]);

  const fetchOrderHistory = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }

    try {
      const response = await apiClient.get<OrderHistoryResponse>("/orders/history", {
        params: {
          page: 1,
          limit: 10,
        },
      });

      setOrders(response.data.data);
      setPagination(response.data.pagination);
      setError(null);
    } catch {
      setError("Chưa thể tải lịch sử đơn hàng.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchOrderHistory();
  }, [fetchOrderHistory]);

  const handleCompleteOrder = async (orderId: number) => {
    setCompletingOrderId(orderId);

    try {
      await apiClient.put(`/orders/${orderId}/complete`);
      toast.success("Cảm ơn bạn đã mua hàng!");
      await fetchOrderHistory(false);
    } catch {
      toast.error("Không thể xác nhận đơn hàng.");
    } finally {
      setCompletingOrderId(null);
    }
  };

  return (
    <section className="py-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-slate-950">
            Lịch sử đơn hàng
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Theo dõi các đơn hàng đã đặt và chi tiết sản phẩm trong từng đơn.
          </p>
        </div>
        {hasOrders && (
          <p className="text-sm text-slate-500">
            {pagination.total} đơn hàng
          </p>
        )}
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Đang tải lịch sử đơn hàng...
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-primary-700">
          {error}
        </div>
      )}

      {!isLoading && !error && !hasOrders && (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-500">
            <PackageSearch className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-lg font-semibold text-slate-950">
            Chưa có đơn hàng nào
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            Khi bạn hoàn tất đặt hàng, các đơn mới nhất sẽ xuất hiện tại đây.
          </p>
          <Link
            to="/catalog"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-primary-500 px-5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-600"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      )}

      {hasOrders && (
        <div className="space-y-3">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const canComplete = order.status === "PROCESSING";
            const isCompleting = completingOrderId === order.id;
            const statusClass =
              statusClassByValue[order.status] ?? "bg-slate-50 text-slate-700 ring-slate-100";

            return (
              <article
                key={order.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="flex w-full flex-col gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="hidden h-11 w-11 items-center justify-center rounded-full bg-slate-50 text-slate-500 sm:flex">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        Mã đơn #{order.id}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Ngày đặt: {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="text-right">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Tổng tiền
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-950">
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold ring-1 ring-inset ${statusClass}`}
                    >
                      {order.status}
                    </span>
                    {canComplete && (
                      <button
                        type="button"
                        className="rounded-xl bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-slate-400"
                        disabled={isCompleting}
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleCompleteOrder(order.id);
                        }}
                      >
                        {isCompleting ? "Đang xác nhận..." : "Xác nhận đã nhận hàng và thanh toán"}
                      </button>
                    )}
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-200 bg-white px-5 py-4">
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-3"
                        >
                          {item.product.imageUrl ? (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="h-14 w-14 rounded-lg border border-slate-100 object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-400">
                              <ShoppingBag className="h-5 w-5" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-950">
                              {item.product.name}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              Số lượng: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right text-sm font-semibold text-slate-950">
                            {formatCurrency(item.unitPrice)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default OrderHistory;



