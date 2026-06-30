import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "../lib/api-client";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED"
  | "FAILED";

type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "EXPIRED";
type PaymentMethod = "COD" | "VNPAY";

interface OrderDto {
  id: string;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
  latestPaymentTransaction?: {
    responseMessage: string | null;
  } | null;
}

type Phase =
  | "loading"
  | "polling"
  | "timeout"
  | "success"
  | "failed"
  | "not_found";

// ─── Config ───────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 30000;

// ─── Formatting helpers ───────────────────────────────────────────────────────

function formatCurrencyVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateTimeVi(isoDate: string): string {
    if (!isoDate) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(isoDate));
}

function getPaymentMethodLabel(method: PaymentMethod): string {
  return method === "COD" ? "Thanh toán khi nhận hàng" : "VNPay";
}

// ─── Badge tone mapping ───────────────────────────────────────────────────────

type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral";

const BADGE_TONE_CLASSES: Record<BadgeTone, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  warning: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  danger: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
  info: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20",
  neutral: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/15",
};

function getPaymentStatusBadge(status: PaymentStatus): { label: string; tone: BadgeTone } {
  switch (status) {
    case "PAID":
      return { label: "Đã thanh toán", tone: "success" };
    case "PENDING":
      return { label: "Chờ thanh toán", tone: "warning" };
    case "FAILED":
      return { label: "Thanh toán thất bại", tone: "danger" };
    case "EXPIRED":
      return { label: "Đã hết hạn", tone: "neutral" };
  }
}

function getOrderStatusBadge(status: OrderStatus): { label: string; tone: BadgeTone } {
  switch (status) {
    case "PENDING":
      return { label: "Chờ xác nhận", tone: "neutral" };
    case "CONFIRMED":
      return { label: "Đang chuẩn bị hàng", tone: "info" };
    case "PROCESSING":
      return { label: "Đang xử lý", tone: "info" };
    case "SHIPPING":
      return { label: "Đang giao hàng", tone: "info" };
    case "DELIVERED":
      return { label: "Đã giao hàng", tone: "success" };
    case "CANCELLED":
      return { label: "Đã hủy", tone: "neutral" };
    case "FAILED":
      return { label: "Thất bại", tone: "danger" };
  }
}

function StatusBadge({ label, tone }: { label: string; tone: BadgeTone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${BADGE_TONE_CLASSES[tone]}`}
    >
      {label}
    </span>
  );
}

// ─── Icon primitives (inline SVG, không thêm dependency) ─────────────────────

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-full w-full" strokeWidth={2.5}>
      <path d="M5 12.5L9.5 17L19 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-full w-full" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" />
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-full w-full" strokeWidth={2.5}>
      <path d="M7 7l10 10M17 7L7 17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-full w-full" strokeWidth={2}>
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" />
      <path d="M19 19l-3.5-3.5" stroke="currentColor" strokeLinecap="round" />
      <path d="M8 8l5 5" stroke="currentColor" strokeLinecap="round" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg className="h-10 w-10 animate-spin text-red-600" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ─── Status icon ring (signature element, stamp-style) ────────────────────────
// Animation viết bằng <style> inline để không cần sửa tailwind.config.

type IconVariant = "success" | "pending" | "danger" | "neutral";

const VARIANT_STYLES: Record<IconVariant, { ring: string; ringSoft: string; icon: string; bg: string }> = {
  success: { ring: "ring-emerald-500", ringSoft: "ring-emerald-200", icon: "text-emerald-600", bg: "bg-emerald-50" },
  pending: { ring: "ring-amber-500", ringSoft: "ring-amber-200", icon: "text-amber-600", bg: "bg-amber-50" },
  danger: { ring: "ring-red-500", ringSoft: "ring-red-200", icon: "text-red-600", bg: "bg-red-50" },
  neutral: { ring: "ring-slate-400", ringSoft: "ring-slate-200", icon: "text-slate-500", bg: "bg-slate-50" },
};

function StatusIconRing({
  variant,
  icon,
  animateStamp = false,
}: {
  variant: IconVariant;
  icon: React.ReactNode;
  animateStamp?: boolean;
}) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div className="relative flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
      {animateStamp && (
        <style>{`
          @keyframes stamp-settle {
            0% { transform: scale(1.4); opacity: 0; }
            60% { transform: scale(0.95); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes stamp-mark {
            0% { transform: scale(0); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      )}
      <div
        className={`absolute inset-0 rounded-full ${styles.ringSoft} ring-8`}
        style={animateStamp ? { animation: "stamp-settle 0.5s ease-out 0.15s both" } : undefined}
      />
      <div
        className={`absolute inset-2 rounded-full ${styles.bg} ring-2 ${styles.ring}`}
        style={animateStamp ? { animation: "stamp-settle 0.4s ease-out both" } : undefined}
      />
      <div
        className={`relative flex h-12 w-12 items-center justify-center ${styles.icon}`}
        style={animateStamp ? { animation: "stamp-mark 0.3s ease-out 0.35s both" } : undefined}
      >
        {icon}
      </div>
    </div>
  );
}

// ─── API call ─────────────────────────────────────────────────────────────────

async function getOrderById(orderId: string) {
  const response = await apiClient.get(`/orders/${orderId}`);
  return response.data;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const transactionRef = searchParams.get("transactionRef") ?? undefined;

  const [phase, setPhase] = useState<Phase>("loading");
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const clearPollingTimers = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const fetchOrder = useCallback(async () => {
    if (!transactionRef) {
      setPhase("not_found");
      return;
    }

    try {
      const res = await getOrderById(transactionRef);
      const data = res.data;
      if (!isMountedRef.current) return;

      setOrder(data);
      setErrorMessage(null);

      if (data.paymentStatus === "PAID") {
        setPhase("success");
        clearPollingTimers();
      } else if (data.paymentStatus === "FAILED" || data.paymentStatus === "EXPIRED") {
        setPhase("failed");
        clearPollingTimers();
      } else {
        setPhase("polling"); // PENDING
      }
    } catch (error) {
      if (!isMountedRef.current) return;

      const isNotFound =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as { response?: { status?: number } }).response?.status === 404;

      if (isNotFound) {
        setPhase("not_found");
        clearPollingTimers();
        return;
      }

      setErrorMessage("Không thể kết nối đến hệ thống. Vui lòng thử lại.");
    }
  }, [transactionRef, clearPollingTimers]);

  // Fetch lần đầu
  useEffect(() => {
    isMountedRef.current = true;
    void fetchOrder();

    return () => {
      isMountedRef.current = false;
      clearPollingTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionRef]);

  // Polling khi phase = "polling" — chỉ start khi paymentStatus đang PENDING
  useEffect(() => {
    if (phase !== "polling") return;
    if (intervalRef.current !== null) return; // tránh tạo interval trùng

    intervalRef.current = setInterval(() => {
      void fetchOrder();
    }, POLL_INTERVAL_MS);

    timeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      clearPollingTimers();
      setPhase("timeout");
    }, POLL_TIMEOUT_MS);

    return () => {
      clearPollingTimers();
    };
  }, [phase, fetchOrder, clearPollingTimers]);

  // ── Navigation handlers ─────────────────────────────────────────────────────

  const goToOrderDetail = () => navigate(`/orders/history`);
  const goToHome = () => navigate("/");
  const goToCart = () => navigate("/cart");
//   const goToRetryPayment = () => order && navigate(`/checkout?retryOrderId=${order.id}`);

  // ── Card shell ───────────────────────────────────────────────────────────────

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 sm:py-16">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.06)] sm:max-w-lg sm:p-10">
        {/* 1. Loading */}
        {phase === "loading" && (
          <>
            <div className="flex flex-col items-center text-center">
              <LoadingSpinner />
              <p className="mt-4 text-[15px] font-medium text-slate-600">
                Đang xác nhận thanh toán...
              </p>
            </div>
            <div className="mt-8 animate-pulse rounded-2xl bg-slate-50 px-5 py-4 sm:px-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2.5">
                  <div className="h-3.5 w-28 rounded-full bg-slate-200" />
                  <div className="h-3.5 w-20 rounded-full bg-slate-200" />
                </div>
              ))}
            </div>
          </>
        )}

        {/* 2. Not found */}
        {phase === "not_found" && (
          <>
            <div className="flex flex-col items-center text-center">
              <StatusIconRing variant="neutral" icon={<SearchOffIcon />} />
              <h1 className="mt-5 text-2xl font-bold text-slate-900 sm:text-[28px]">
                Không tìm thấy đơn hàng
              </h1>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
                Đơn hàng bạn đang tìm không tồn tại hoặc đã bị xoá.
              </p>
            </div>
            <button
              type="button"
              onClick={goToHome}
              className="mt-8 w-full rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              Về trang chủ
            </button>
          </>
        )}

        {/* 3. Polling */}
        {phase === "polling" && (
          <>
            <div className="flex flex-col items-center text-center">
              <StatusIconRing variant="pending" icon={<ClockIcon />} />
              <h1 className="mt-5 text-2xl font-bold text-slate-900 sm:text-[28px]">
                Đang xác nhận thanh toán
              </h1>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
                Hệ thống đang xác nhận giao dịch với VNPay. Vui lòng đợi trong giây lát.
              </p>
            </div>

            {order && (
              <div className="mt-8 rounded-2xl bg-slate-50 px-5 py-4 sm:px-6">
                <OrderDetailRows order={order} />
              </div>
            )}

            {errorMessage && (
              <p className="mt-4 text-center text-sm text-red-500">{errorMessage}</p>
            )}
          </>
        )}

        {/* 4. Timeout */}
        {phase === "timeout" && (
          <>
            <div className="flex flex-col items-center text-center">
              <StatusIconRing variant="pending" icon={<ClockIcon />} />
              <h1 className="mt-5 text-2xl font-bold text-slate-900 sm:text-[28px]">
                Thanh toán đang được xử lý
              </h1>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
                Bạn có thể kiểm tra lại trong trang Đơn hàng sau ít phút.
              </p>
            </div>

            {order && (
              <div className="mt-8 rounded-2xl bg-slate-50 px-5 py-4 sm:px-6">
                <OrderDetailRows order={order} />
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={goToHome}
                className="order-2 flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:order-1"
              >
                Về trang chủ
              </button>
              <button
                type="button"
                onClick={goToOrderDetail}
                className="order-1 flex-1 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 sm:order-2"
              >
                Xem đơn hàng
              </button>
            </div>
          </>
        )}

        {/* 5. Success */}
        {phase === "success" && order && (
          <>
            <div className="flex flex-col items-center text-center">
              <StatusIconRing variant="success" icon={<CheckIcon />} animateStamp />
              <h1 className="mt-5 text-2xl font-bold text-slate-900 sm:text-[28px]">
                Thanh toán thành công
              </h1>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
                Đơn hàng của bạn đã được thanh toán thành công. Chúng tôi sẽ xử lý đơn hàng trong
                thời gian sớm nhất.
              </p>
            </div>

            <div className="mt-8 rounded-2xl bg-slate-50 px-5 py-4 sm:px-6">
              <OrderDetailRows order={order} />
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={goToHome}
                className="order-2 flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:order-1"
              >
                Tiếp tục mua sắm
              </button>
              <button
                type="button"
                onClick={goToOrderDetail}
                className="order-1 flex-1 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 sm:order-2"
              >
                Xem chi tiết đơn hàng
              </button>
            </div>
          </>
        )}

        {/* 6. Failed */}
        {phase === "failed" && order && (
          <>
            <div className="flex flex-col items-center text-center">
              <StatusIconRing variant="danger" icon={<CrossIcon />} />
              <h1 className="mt-5 text-2xl font-bold text-slate-900 sm:text-[28px]">
                Thanh toán thất bại
              </h1>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
                {order.latestPaymentTransaction?.responseMessage ??
                  "Giao dịch không thành công. Vui lòng thử lại."}
              </p>
            </div>

            <div className="mt-8 rounded-2xl bg-slate-50 px-5 py-4 sm:px-6">
              <OrderDetailRows order={order} />
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={goToCart}
                className="order-2 flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:order-1"
              >
                Quay về giỏ hàng
              </button>
              {/* <button
                type="button"
                onClick={goToRetryPayment}
                className="order-1 flex-1 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 sm:order-2"
              >
                Thanh toán lại
              </button> */}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

// ─── Order detail rows (receipt style, dùng chung cho nhiều phase) ────────────

function OrderDetailRows({ order }: { order: OrderDto }) {
  const orderStatusBadge = getOrderStatusBadge(order.status);
  const paymentStatusBadge = getPaymentStatusBadge(order.paymentStatus);
  return (
    <>
      <Row label="Mã đơn hàng">#{order?.id}</Row>
      <Row label="Tổng tiền">{formatCurrencyVnd(order.total)}</Row>
      <Row label="Phương thức thanh toán">{getPaymentMethodLabel(order.paymentMethod)}</Row>
      <Row label="Thời gian đặt hàng">{formatDateTimeVi(order.createdAt)}</Row>

      <div className="flex items-center justify-between gap-3 py-2.5">
        <span className="text-sm text-slate-500">Trạng thái thanh toán</span>
        {paymentStatusBadge && (
          <StatusBadge label={paymentStatusBadge.label} tone={paymentStatusBadge.tone} />
        )}
      </div>
      <div className="flex items-center justify-between gap-3 py-2.5">
        <span className="text-sm text-slate-500">Trạng thái đơn hàng</span>
        {orderStatusBadge && (
          <StatusBadge label={orderStatusBadge.label} tone={orderStatusBadge.tone} />
        )}
      </div>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2.5">
      <span className="shrink-0 text-sm text-slate-500">{label}</span>
      <span className="h-px flex-1 border-b border-dashed border-slate-200" />
      <span className="shrink-0 text-right text-sm font-semibold text-slate-900 tabular-nums">
        {children}
      </span>
    </div>
  );
}

export default PaymentResult;