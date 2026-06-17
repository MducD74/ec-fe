import { TicketPercent } from "lucide-react";

export interface Voucher {
  id: number;
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minOrderValue: number;
  maxDiscountValue?: number | null;
  endDate: string;
}

interface VoucherListProps {
  vouchers: Voucher[];
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDiscount(voucher: Voucher) {
  if (voucher.discountType === "PERCENTAGE") {
    return `Giảm ${voucher.discountValue}%`;
  }

  return `Giảm ${formatCurrency(voucher.discountValue)}`;
}

function formatVoucherCondition(voucher: Voucher) {
  const minimumText =
    voucher.minOrderValue > 0
      ? `Đơn tối thiểu ${formatCurrency(voucher.minOrderValue)}`
      : "Không yêu cầu đơn tối thiểu";
  const maxDiscountText =
    voucher.discountType === "PERCENTAGE" && voucher.maxDiscountValue
      ? `, tối đa ${formatCurrency(voucher.maxDiscountValue)}`
      : "";

  return `${minimumText}${maxDiscountText}`;
}

function formatExpiryDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function VoucherList({ vouchers, copiedCode, onCopyCode }: VoucherListProps) {
  if (vouchers.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
            Ưu đãi hôm nay
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-normal text-slate-950">
            Khuyến mãi độc quyền
          </h2>
        </div>
      </div>

      <div className="hide-scrollbar flex snap-x gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
        {vouchers.slice(0, 3).map((voucher) => {
          const isCopied = copiedCode === voucher.code;

          return (
            <article
              key={voucher.id}
              className="relative flex min-h-[220px] w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-sm md:w-auto"
            >
              <span className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-slate-200 bg-white" />
              <span className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-slate-200 bg-white" />

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white text-slate-950 shadow-sm">
                    <TicketPercent className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    {voucher.code}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-950">{formatDiscount(voucher)}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {formatVoucherCondition(voucher)}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Hết hạn: {formatExpiryDate(voucher.endDate)}
                </p>
              </div>

              <div className="border-t border-dashed border-gray-300 p-4">
                <button
                  type="button"
                  onClick={() => onCopyCode(voucher.code)}
                  className={`inline-flex h-10 w-full items-center justify-center rounded-md px-4 text-sm font-semibold transition-colors ${
                    isCopied
                      ? "border border-slate-200 bg-slate-100 text-slate-400"
                      : "border border-gray-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 hover:text-primary-600"
                  }`}
                >
                  {isCopied ? "Đã sao chép" : "Sao chép"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default VoucherList;



