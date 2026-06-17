import { type UIEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, Ticket, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { CartItem } from "../components/CartItemCard";
import apiClient from "../lib/api-client";
import { ToastHelper } from "../lib/toast-helper";

interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine: string;
  ward: string;
  district: string;
  city: string;
}

interface CheckoutOrderItem {
  productId: number;
}

interface CheckoutOrder {
  items?: CheckoutOrderItem[];
}

interface CheckoutResponse {
  order?: CheckoutOrder;
  data?: CheckoutOrder;
}

interface CartResponse {
  cart: {
    id: number;
    items: CartItem[];
  };
}

interface VoucherValidateResponse {
  valid: boolean;
  discountAmount: number;
  message?: string;
}

interface Voucher {
  id: number;
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minOrderValue: number;
}

interface VouchersResponse {
  data?: Voucher[];
  vouchers?: Voucher[];
  pagination?: {
    hasMore?: boolean;
  };
}

const initialShippingAddress: ShippingAddress = {
  fullName: "",
  phone: "",
  addressLine: "",
  ward: "",
  district: "",
  city: "",
};

const extractVouchers = (response: VouchersResponse) => response.data ?? response.vouchers ?? [];

async function logPurchaseInteractions(items: CheckoutOrderItem[]) {
  try {
    await Promise.allSettled(
      items.map((item) =>
        apiClient.post("/interactions", {
          productId: item.productId,
          actionType: "PURCHASE",
        }),
      ),
    );
  } catch (error) {
    console.warn("Unable to log purchase interactions:", error);
  }
}

function Checkout() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [shippingAddress, setShippingAddress] = useState(initialShippingAddress);
  const [vouchersList, setVouchersList] = useState<Voucher[]>([]);
  const [voucherSearch, setVoucherSearch] = useState("");
  const [debouncedVoucherSearch, setDebouncedVoucherSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucherCode, setAppliedVoucherCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const voucherRequestId = useRef(0);

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        return sum + Number(item.product.price) * item.quantity;
      }, 0),
    [items],
  );
  const payableTotal = Math.max(subtotal - discountAmount, 0);

  useEffect(() => {
    let isMounted = true;

    async function loadCart() {
      try {
        const response = await apiClient.get<CartResponse>("/cart");

        if (isMounted) {
          setItems(response.data.cart.items);
        }
      } catch {
        if (isMounted) {
          ToastHelper.error("Không thể tải giỏ hàng.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingCart(false);
        }
      }
    }

    void loadCart();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateShippingAddress = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((currentAddress) => ({
      ...currentAddress,
      [field]: value,
    }));
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);

  const formatCompactCurrency = (value: number) => {
    const formatter = new Intl.NumberFormat("vi-VN", {
      maximumFractionDigits: 1,
    });

    if (value >= 1_000_000) {
      return `${formatter.format(value / 1_000_000)}tr`;
    }

    if (value >= 1_000) {
      return `${formatter.format(value / 1_000)}k`;
    }

    return formatCurrency(value);
  };

  const formatVoucherDiscount = (voucher: Voucher) => {
    if (voucher.discountType === "PERCENTAGE") {
      return `Giảm ${voucher.discountValue}%`;
    }

    return `Giảm ${formatCurrency(voucher.discountValue)}`;
  };

  const loadMoreVouchers = useCallback(async (nextPage: number, searchText: string) => {
    const requestId = voucherRequestId.current + 1;
    voucherRequestId.current = requestId;
    setIsLoadingVouchers(true);

    try {
      const response = await apiClient.get<VouchersResponse>("/vouchers", {
        params: {
          search: searchText,
          page: nextPage,
          limit: 5,
        },
      });
      const nextVouchers = extractVouchers(response.data);

      if (requestId !== voucherRequestId.current) {
        return;
      }

      setVouchersList((currentVouchers) => {
        if (nextPage === 1) {
          return nextVouchers;
        }

        const existingIds = new Set(currentVouchers.map((voucher) => voucher.id));
        return [
          ...currentVouchers,
          ...nextVouchers.filter((voucher) => !existingIds.has(voucher.id)),
        ];
      });
      setHasMore(Boolean(response.data.pagination?.hasMore));
    } catch {
      if (requestId !== voucherRequestId.current) {
        return;
      }

      if (nextPage === 1) {
        setVouchersList([]);
      }
      setHasMore(false);
    } finally {
      if (requestId === voucherRequestId.current) {
        setIsLoadingVouchers(false);
      }
    }
  }, []);

  useEffect(() => {
    const debounceTimer = window.setTimeout(() => {
      setDebouncedVoucherSearch(voucherSearch.trim());
    }, 300);

    return () => {
      window.clearTimeout(debounceTimer);
    };
  }, [voucherSearch]);

  useEffect(() => {
    if (!isVoucherModalOpen) {
      return;
    }

    setVouchersList([]);
    setPage(1);
    setHasMore(true);
    void loadMoreVouchers(1, debouncedVoucherSearch);
  }, [debouncedVoucherSearch, isVoucherModalOpen, loadMoreVouchers]);

  useEffect(() => {
    if (!isVoucherModalOpen || page === 1) {
      return;
    }

    void loadMoreVouchers(page, debouncedVoucherSearch);
  }, [debouncedVoucherSearch, isVoucherModalOpen, loadMoreVouchers, page]);

  const openVoucherModal = () => {
    setIsVoucherModalOpen(true);
  };

  const handleVouchersScroll = (event: UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 48;

    if (isNearBottom && hasMore && !isLoadingVouchers) {
      setPage((currentPage) => currentPage + 1);
    }
  };

  const handleVoucherCodeChange = (value: string) => {
    setVoucherCode(value);
    setVoucherError(null);

    if (appliedVoucherCode && value.trim() !== appliedVoucherCode) {
      setAppliedVoucherCode("");
      setDiscountAmount(0);
    }
  };

  const handleApplyVoucher = async (codeOverride?: string) => {
    const normalizedCode = (codeOverride ?? voucherCode).trim();

    setVoucherError(null);

    if (!normalizedCode) {
      setDiscountAmount(0);
      setAppliedVoucherCode("");
      setVoucherError("Vui lòng nhập mã giảm giá.");
      return;
    }

    if (subtotal <= 0) {
      setDiscountAmount(0);
      setAppliedVoucherCode("");
      setVoucherError("Giỏ hàng chưa có sản phẩm để áp dụng mã.");
      return;
    }

    setIsApplyingVoucher(true);

    try {
      const response = await apiClient.post<VoucherValidateResponse>("/vouchers/validate", {
        code: normalizedCode,
        orderTotal: subtotal,
      });

      setDiscountAmount(response.data.discountAmount);
      setAppliedVoucherCode(normalizedCode);
      setVoucherCode(normalizedCode);
      ToastHelper.success("Áp dụng mã giảm giá thành công!");
    } catch (error) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
          ? error.response.data.message
          : "Mã giảm giá không hợp lệ.";

      setDiscountAmount(0);
      setAppliedVoucherCode("");
      setVoucherError(message);
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handleSelectVoucher = async (voucher: Voucher) => {
    if (subtotal < voucher.minOrderValue) {
      return;
    }

    setVoucherCode(voucher.code);
    setIsVoucherModalOpen(false);
    await handleApplyVoucher(voucher.code);
  };

  const handleCheckout = async () => {
    setIsSubmitting(true);

    try {
      const response = await apiClient.post<CheckoutResponse>("/orders/checkout", {
        address: shippingAddress,
        paymentMethod: "COD",
        voucherCode: appliedVoucherCode || undefined,
      });
      const order = response.data.order ?? response.data.data;
      const orderItems = order?.items ?? [];

      await logPurchaseInteractions(orderItems);

      ToastHelper.success("Đặt hàng thành công!");
      navigate("/orders/history");
    } catch {
      ToastHelper.error("Đặt hàng thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl py-8">
      <h1 className="text-2xl font-semibold tracking-normal text-slate-950">Thanh toán</h1>
      <p className="mt-2 text-sm text-slate-600">Xác nhận thông tin giao hàng và hoàn tất đơn.</p>

      <div className="mt-6 space-y-5 rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Thông tin nhận hàng</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Họ và tên
              <input
                value={shippingAddress.fullName}
                onChange={(event) => updateShippingAddress("fullName", event.target.value)}
                className="mt-1 h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Số điện thoại
              <input
                value={shippingAddress.phone}
                onChange={(event) => updateShippingAddress("phone", event.target.value)}
                className="mt-1 h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
              Địa chỉ
              <input
                value={shippingAddress.addressLine}
                onChange={(event) => updateShippingAddress("addressLine", event.target.value)}
                className="mt-1 h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Phường/Xã
              <input
                value={shippingAddress.ward}
                onChange={(event) => updateShippingAddress("ward", event.target.value)}
                className="mt-1 h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Quận/Huyện
              <input
                value={shippingAddress.district}
                onChange={(event) => updateShippingAddress("district", event.target.value)}
                className="mt-1 h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
              Tỉnh/Thành phố
              <input
                value={shippingAddress.city}
                onChange={(event) => updateShippingAddress("city", event.target.value)}
                className="mt-1 h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </label>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-5">
          <h2 className="text-base font-semibold text-slate-950">Phương thức thanh toán</h2>
          <div className="mt-4 space-y-3">
            <label className="flex items-start gap-3 rounded-md border border-gray-300 bg-slate-50 p-4">
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked
                readOnly
                className="mt-1 h-4 w-4 accent-slate-950"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-950">
                  Thanh toán khi nhận hàng (COD)
                </span>
                <span className="mt-1 block text-sm text-slate-600">
                  Thanh toán bằng tiền mặt khi đơn hàng được giao đến địa chỉ nhận hàng.
                </span>
              </span>
            </label>
            <label className="flex cursor-not-allowed items-start gap-3 rounded-md border border-slate-200 bg-white p-4 opacity-50">
              <input
                type="radio"
                name="paymentMethod"
                value="ONLINE"
                disabled
                className="mt-1 h-4 w-4 accent-slate-950"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-950">
                  Thanh toán trực tuyến
                </span>
                <span className="mt-1 block text-sm text-slate-600">Tạm thời chưa khả dụng.</span>
              </span>
            </label>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-5">
          <h2 className="text-base font-semibold text-slate-950">Mã giảm giá</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={voucherCode}
              onChange={(event) => handleVoucherCodeChange(event.target.value)}
              placeholder="Nhập mã giảm giá"
              className="h-11 flex-1 rounded-md border border-gray-300 bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
            <button
              type="button"
              onClick={openVoucherModal}
              disabled={isLoadingCart}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-5 text-sm font-semibold text-slate-800 transition-colors hover:border-gray-300 hover:bg-white disabled:cursor-not-allowed disabled:text-slate-400"
            >
              <Ticket className="h-4 w-4" />
              Chọn mã giảm giá
            </button>
            <button
              type="button"
              onClick={() => handleApplyVoucher()}
              disabled={isApplyingVoucher || isLoadingCart}
              className="inline-flex h-11 items-center justify-center rounded-md border border-slate-950 bg-white px-5 text-sm font-semibold text-slate-950 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
            >
              {isApplyingVoucher ? "Đang áp dụng..." : "Áp dụng"}
            </button>
          </div>
          {voucherError && <p className="mt-2 text-sm text-primary-600">{voucherError}</p>}
        </div>

        <div className="border-t border-slate-200 pt-5">
          <h2 className="text-base font-semibold text-slate-950">Tổng tiền</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Tạm tính</span>
              <span className="font-semibold text-slate-950">
                {isLoadingCart ? "Đang tải..." : formatCurrency(subtotal)}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-emerald-700">
                <span>Giảm giá</span>
                <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-base">
              <span className="font-semibold text-slate-950">Tổng thanh toán</span>
              <span className="font-bold text-slate-950">{formatCurrency(payableTotal)}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCheckout}
          disabled={isSubmitting}
          className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary-500 px-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? "Đang xử lý..." : "Xác nhận đặt hàng"}
        </button>
      </div>

      {isVoucherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-primary-500/45 px-4 py-4 backdrop-blur-sm sm:items-center">
          <div className="max-h-[86vh] w-full max-w-2xl overflow-hidden rounded-[24px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-950">Chọn mã giảm giá</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Mã giảm giá phù hợp sẽ được áp dụng ngay vào đơn hàng.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsVoucherModalOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 hover:text-primary-600"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-slate-100 px-5 py-4">
              <label className="relative block">
                <span className="sr-only">Tìm kiếm mã giảm giá</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={voucherSearch}
                  onChange={(event) => setVoucherSearch(event.target.value)}
                  placeholder="Tìm kiếm mã giảm giá..."
                  className="h-11 w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </label>
            </div>

            <div className="max-h-[56vh] space-y-3 overflow-y-auto px-5 py-5" onScroll={handleVouchersScroll}>
              {isLoadingVouchers && vouchersList.length === 0 && (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
                  ))}
                </div>
              )}

              {!isLoadingVouchers && vouchersList.length === 0 && (
                <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                  Chưa có voucher khả dụng.
                </p>
              )}

              {vouchersList.map((voucher) => {
                const isEligible = subtotal >= voucher.minOrderValue;

                return (
                    <button
                      key={voucher.id}
                      type="button"
                      onClick={() => handleSelectVoucher(voucher)}
                      disabled={!isEligible || isApplyingVoucher}
                      className={`group flex w-full flex-col overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition-all sm:flex-row sm:items-stretch ${
                        isEligible
                          ? "border-slate-200 hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md"
                          : "cursor-not-allowed border-slate-100 opacity-50"
                      }`}
                    >
                      <div className="flex flex-1 gap-4 p-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-500 text-white">
                          <Ticket className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold uppercase tracking-[0.14em] text-slate-950">
                            {voucher.code}
                          </p>
                          <p className="mt-2 text-xl font-bold text-slate-950">
                            {formatVoucherDiscount(voucher)}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            Đơn tối thiểu {formatCompactCurrency(voucher.minOrderValue)}
                          </p>
                          {!isEligible && (
                            <p className="mt-2 text-sm font-semibold text-primary-600">
                              Chưa đủ điều kiện
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="border-t border-dashed border-slate-200 px-4 py-3 sm:flex sm:w-36 sm:items-center sm:justify-center sm:border-l sm:border-t-0">
                        <span
                          className={`inline-flex h-10 w-full items-center justify-center rounded-md text-sm font-semibold transition-colors ${
                            isEligible
                              ? "bg-primary-500 text-white group-hover:bg-primary-600"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {isEligible ? "Chọn mã" : "Không đủ"}
                        </span>
                      </div>
                    </button>
                );
              })}

              {isLoadingVouchers && vouchersList.length > 0 && (
                <p className="py-2 text-center text-sm text-slate-500">Đang tải thêm mã giảm giá...</p>
              )}

              {!isLoadingVouchers && hasMore && vouchersList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setPage((currentPage) => currentPage + 1)}
                  className="mx-auto flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:border-gray-300 hover:bg-slate-50"
                >
                  Xem thêm mã giảm giá
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Checkout;



