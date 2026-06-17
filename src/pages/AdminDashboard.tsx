import {
  BarChart3,
  Bot,
  CheckCircle2,
  ClipboardList,
  Loader2,
  PackageCheck,
  ReceiptText,
  TicketPercent,
  Users,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import apiClient from "../lib/api-client";

type AdminTab = "overview" | "orders" | "vouchers";

interface AdminStats {
  totalRevenue: string | number;
  totalOrders: number;
  totalUsers: number;
  orderStatusCounts: {
    PENDING: number;
    PROCESSING: number;
    DELIVERED: number;
  };
}

interface AdminStatsResponse {
  success: boolean;
  data: AdminStats;
}

interface AdminOrderItem {
  id: number;
  quantity: number;
  product?: {
    id: number;
    name: string;
  };
}

interface AdminOrder {
  id: number;
  voucherId?: number | null;
  total: string | number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  items: AdminOrderItem[];
}

interface AdminOrdersResponse {
  success: boolean;
  data?: AdminOrder[];
  orders?: AdminOrder[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface Voucher {
  id: number;
  code: string;
  description?: string | null;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minOrderValue: number;
  endDate: string;
}

interface VouchersResponse {
  data?: Voucher[];
  vouchers?: Voucher[];
}

const tabs: Array<{
  id: AdminTab;
  label: string;
  icon: typeof BarChart3;
}> = [
  { id: "overview", label: "Tổng quan", icon: BarChart3 },
  { id: "orders", label: "Đơn hàng", icon: ClipboardList },
  { id: "vouchers", label: "Voucher & AI", icon: Bot },
];

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

const statusLabelByValue: Record<string, string> = {
  PENDING: "Chờ xử lý",
  PROCESSING: "Đang xử lý",
  PAID: "Đã thanh toán",
  SHIPPED: "Đang giao",
  COMPLETED: "Đã giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
};

const statusClassByValue: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-100",
  PROCESSING: "bg-sky-50 text-sky-700 ring-sky-100",
  PAID: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  SHIPPED: "bg-blue-50 text-blue-700 ring-blue-100",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  DELIVERED: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  CANCELLED: "bg-red-50 text-primary-700 ring-red-100",
};

function formatCurrency(value: string | number) {
  return currencyFormatter.format(Number(value));
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function formatDiscount(voucher: Voucher) {
  if (voucher.discountType === "PERCENTAGE") {
    return `Giảm ${voucher.discountValue}%`;
  }

  return `Giảm ${formatCurrency(voucher.discountValue)}`;
}

function getOrders(response: AdminOrdersResponse) {
  return response.data ?? response.orders ?? [];
}

function getVouchers(response: VouchersResponse) {
  return response.data ?? response.vouchers ?? [];
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [isVouchersLoading, setIsVouchersLoading] = useState(true);
  const [trainingAi, setTrainingAi] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true);

    try {
      const response = await apiClient.get<AdminStatsResponse>("/admin/stats");
      setStats(response.data.data);
    } catch {
      toast.error("Không thể tải số liệu tổng quan.");
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsOrdersLoading(true);
    }

    try {
      const response = await apiClient.get<AdminOrdersResponse>("/admin/orders", {
        params: {
          page: 1,
        },
      });
      setOrders(getOrders(response.data));
    } catch {
      toast.error("Không thể tải danh sách đơn hàng.");
    } finally {
      setIsOrdersLoading(false);
    }
  }, []);

  const fetchVouchers = useCallback(async () => {
    setIsVouchersLoading(true);

    try {
      const response = await apiClient.get<VouchersResponse>("/vouchers", {
        params: {
          page: 1,
          limit: 6,
        },
      });
      setVouchers(getVouchers(response.data));
    } catch {
      toast.error("Không thể tải danh sách voucher.");
    } finally {
      setIsVouchersLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStats();
    void fetchOrders();
    void fetchVouchers();
  }, [fetchStats, fetchOrders, fetchVouchers]);

  const statusTotal = useMemo(() => {
    if (!stats) {
      return 0;
    }

    return (
      stats.orderStatusCounts.PENDING +
      stats.orderStatusCounts.PROCESSING +
      stats.orderStatusCounts.DELIVERED
    );
  }, [stats]);

  const updateOrderStatus = async (orderId: number, status: string) => {
    setUpdatingOrderId(orderId);

    try {
      await apiClient.put(`/admin/orders/${orderId}/status`, { status });
      toast.success("Đã cập nhật trạng thái đơn hàng.");
      await Promise.all([fetchOrders(false), fetchStats()]);
    } catch {
      toast.error("Không thể cập nhật trạng thái đơn hàng.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const trainAiModel = async () => {
    setTrainingAi(true);

    try {
      await apiClient.post("/admin/ai/train");
      toast.success("Đã kích hoạt huấn luyện AI ngoại tuyến.");
    } catch {
      toast.error("Không thể kích hoạt huấn luyện AI.");
    } finally {
      setTrainingAi(false);
    }
  };

  return (
    <section className="py-6">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
          Trung tâm quản trị
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
          Bảng điều khiển Admin
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-lg border border-slate-100 bg-white p-3 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`flex h-12 w-full items-center gap-3 rounded-md px-4 text-left text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-primary-500 text-white"
                      : "text-slate-700 hover:bg-slate-50 hover:text-primary-600"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <article className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500">Doanh thu</p>
                    <Wallet className="h-5 w-5 text-emerald-600" />
                  </div>
                  <p className="mt-4 text-3xl font-bold text-slate-950">
                    {isStatsLoading ? "..." : formatCurrency(stats?.totalRevenue ?? 0)}
                  </p>
                </article>

                <article className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500">Đơn hàng</p>
                    <ReceiptText className="h-5 w-5 text-sky-600" />
                  </div>
                  <p className="mt-4 text-3xl font-bold text-slate-950">
                    {isStatsLoading ? "..." : stats?.totalOrders ?? 0}
                  </p>
                </article>

                <article className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500">Khách hàng</p>
                    <Users className="h-5 w-5 text-indigo-600" />
                  </div>
                  <p className="mt-4 text-3xl font-bold text-slate-950">
                    {isStatsLoading ? "..." : stats?.totalUsers ?? 0}
                  </p>
                </article>
              </div>

              <section className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">Tỷ lệ trạng thái đơn hàng</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Theo dõi nhanh các đơn đang chờ, đang xử lý và đã giao.
                    </p>
                  </div>
                  <BarChart3 className="h-5 w-5 text-slate-400" />
                </div>

                <div className="space-y-4">
                  {[
                    {
                      label: "Đã giao",
                      value: stats?.orderStatusCounts.DELIVERED ?? 0,
                      color: "bg-emerald-500",
                    },
                    {
                      label: "Đang xử lý",
                      value: stats?.orderStatusCounts.PROCESSING ?? 0,
                      color: "bg-amber-500",
                    },
                    {
                      label: "Chờ xử lý",
                      value: stats?.orderStatusCounts.PENDING ?? 0,
                      color: "bg-slate-500",
                    },
                  ].map((item) => {
                    const percent = statusTotal > 0 ? Math.round((item.value / statusTotal) * 100) : 0;

                    return (
                      <div key={item.label}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700">{item.label}</span>
                          <span className="text-slate-500">
                            {item.value} đơn · {percent}%
                          </span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${item.color}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {activeTab === "orders" && (
            <section className="rounded-lg border border-slate-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Quản lý đơn hàng</h2>
                  <p className="mt-1 text-sm text-slate-500">Cập nhật trạng thái giao hàng cho từng đơn.</p>
                </div>
                <PackageCheck className="h-5 w-5 text-slate-400" />
              </div>

              {isOrdersLoading ? (
                <div className="flex items-center gap-2 px-5 py-8 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tải danh sách đơn hàng...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-5 py-3 font-semibold">Mã đơn</th>
                        <th className="px-5 py-3 font-semibold">Thanh toán</th>
                        <th className="px-5 py-3 font-semibold">Voucher</th>
                        <th className="px-5 py-3 font-semibold">Mặt hàng</th>
                        <th className="px-5 py-3 font-semibold">Tổng tiền</th>
                        <th className="px-5 py-3 font-semibold">Trạng thái</th>
                        <th className="px-5 py-3 font-semibold">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.map((order) => {
                        const isUpdating = updatingOrderId === order.id;
                        const statusClass =
                          statusClassByValue[order.status] ?? "bg-slate-50 text-slate-700 ring-slate-100";

                        return (
                          <tr key={order.id} className="align-top">
                            <td className="px-5 py-4">
                              <p className="font-semibold text-slate-950">#{order.id}</p>
                              <p className="mt-1 text-xs text-slate-500">{formatDate(order.createdAt)}</p>
                            </td>
                            <td className="px-5 py-4 text-slate-700">{order.paymentMethod}</td>
                            <td className="px-5 py-4 text-slate-700">
                              {order.voucherId ? `#${order.voucherId}` : "Không có"}
                            </td>
                            <td className="px-5 py-4 text-slate-700">
                              {order.items.length} sản phẩm
                            </td>
                            <td className="px-5 py-4 font-semibold text-slate-950">
                              {formatCurrency(order.total)}
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass}`}
                              >
                                {statusLabelByValue[order.status] ?? order.status}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex flex-col gap-2">
                                <select
                                  className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                  value={order.status === "COMPLETED" ? "DELIVERED" : order.status}
                                  disabled={isUpdating}
                                  onChange={(event) => {
                                    void updateOrderStatus(order.id, event.target.value);
                                  }}
                                >
                                  <option value="PENDING">Chờ xử lý</option>
                                  <option value="PROCESSING">Đang xử lý</option>
                                  <option value="SHIPPED">Đang giao</option>
                                  <option value="DELIVERED">Đã giao</option>
                                  <option value="CANCELLED">Đã hủy</option>
                                </select>

                                <button
                                  type="button"
                                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary-500 px-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-slate-400"
                                  disabled={isUpdating}
                                  onClick={() => {
                                    void updateOrderStatus(order.id, "DELIVERED");
                                  }}
                                >
                                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                  Xác nhận giao hàng
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {orders.length === 0 && (
                    <p className="px-5 py-8 text-sm text-slate-500">Chưa có đơn hàng nào.</p>
                  )}
                </div>
              )}
            </section>
          )}

          {activeTab === "vouchers" && (
            <div className="space-y-5">
              <section className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">Voucher & AI Control</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Kích hoạt huấn luyện gợi ý và theo dõi ưu đãi đang hoạt động.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                    disabled={trainingAi}
                    onClick={trainAiModel}
                  >
                    {trainingAi ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
                    Kích hoạt Huấn luyện AI (Offline Training)
                  </button>
                </div>
              </section>

              <section className="rounded-lg border border-slate-100 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <h2 className="text-lg font-semibold text-slate-950">Danh sách voucher rút gọn</h2>
                  <TicketPercent className="h-5 w-5 text-slate-400" />
                </div>

                {isVouchersLoading ? (
                  <div className="flex items-center gap-2 px-5 py-8 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tải danh sách voucher...
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {vouchers.map((voucher) => (
                      <article
                        key={voucher.id}
                        className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-primary-500 px-2.5 py-1 text-xs font-semibold text-white">
                              {voucher.code}
                            </span>
                            <span className="text-sm font-semibold text-slate-950">
                              {formatDiscount(voucher)}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-500">
                            {voucher.description ?? "Voucher đang hoạt động"}
                          </p>
                        </div>
                        <p className="text-sm text-slate-500">
                          Hết hạn: {formatDate(voucher.endDate)}
                        </p>
                      </article>
                    ))}

                    {vouchers.length === 0 && (
                      <p className="px-5 py-8 text-sm text-slate-500">Chưa có voucher đang hoạt động.</p>
                    )}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminDashboard;



