import { TicketPercent } from "lucide-react";

interface Voucher {
  code: string;
  title: string;
  description: string;
  accent: string;
}

const vouchers: Voucher[] = [
  {
    code: "WHITE10",
    title: "Giảm 10%",
    description: "Cho đơn hàng đầu tiên từ 399K.",
    accent: "bg-sky-50 border-sky-200",
  },
  {
    code: "FREESHIP",
    title: "Miễn phí giao hàng",
    description: "Áp dụng cho đơn từ 499K.",
    accent: "bg-emerald-50 border-emerald-200",
  },
  {
    code: "LUXE15",
    title: "Ưu đãi 15%",
    description: "Dành cho bộ sưu tập cao cấp.",
    accent: "bg-rose-50 border-rose-200",
  },
];

function VoucherList() {
  return (
    <section>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
            Ưu đãi hôm nay
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
            Voucher dành riêng cho bạn
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-slate-500">
          Lưu mã trước khi thanh toán để tận hưởng mức giá tốt hơn.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {vouchers.map((voucher) => (
          <article
            key={voucher.code}
            className={`relative overflow-hidden rounded-lg border border-dashed ${voucher.accent} p-5`}
          >
            <span className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white" />
            <span className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white" />

            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white text-slate-950 shadow-sm">
                <TicketPercent className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                {voucher.code}
              </span>
            </div>

            <h3 className="mt-5 text-xl font-semibold text-slate-950">{voucher.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{voucher.description}</p>

            <button
              type="button"
              className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-slate-950 shadow-sm transition-colors hover:bg-slate-950 hover:text-white"
            >
              Lưu mã
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default VoucherList;
