import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import AiRecommendations from "../components/AiRecommendations";
import HeroBanner from "../components/HeroBanner";
import StoreServices from "../components/StoreServices";
import TrendingProducts from "../components/TrendingProducts";
import VoucherList, { type Voucher } from "../components/VoucherList";
import apiClient from "../lib/api-client";

interface VouchersResponse {
  data?: Voucher[];
  vouchers?: Voucher[];
}

function extractVouchers(response: VouchersResponse) {
  return response.data ?? response.vouchers ?? [];
}

function Home() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadVouchers() {
      try {
        const response = await apiClient.get<VouchersResponse>("/vouchers");
        if (isMounted) {
          setVouchers(extractVouchers(response.data));
        }
      } catch {
        if (isMounted) {
          setVouchers([]);
        }
      }
    }

    void loadVouchers();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success("Đã sao chép mã giảm giá thành công!");
      window.setTimeout(() => {
        setCopiedCode((currentCode) => (currentCode === code ? null : currentCode));
      }, 2000);
    } catch {
      toast.error("Không thể sao chép mã giảm giá.");
    }
  };

  return (
    <div className="overflow-x-hidden">
      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="px-4 pb-0 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <HeroBanner />
        </div>
      </section>

      {/* ─── STORE SERVICES — full-bleed slate strip ─────── */}
      <section className="mt-14 bg-slate-50 sm:mt-16">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <StoreServices />
        </div>
      </section>

      {/* ─── AI RECOMMENDATIONS — gradient signature section  */}
      <AiRecommendations />

      {/* ─── VOUCHERS — white section ────────────────────── */}
      {vouchers.length > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <VoucherList
              vouchers={vouchers}
              copiedCode={copiedCode}
              onCopyCode={handleCopyCode}
            />
          </div>
        </section>
      )}

      {/* ─── TRENDING PRODUCTS — slate-50 section ────────── */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <TrendingProducts />
        </div>
      </section>

      {/* ─── CTA BANNER — bottom call-to-action ──────────── */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 sm:pb-20 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-slate-950 px-8 py-14 text-center shadow-2xl sm:px-12 sm:py-16">
            {/* Decorative lights */}
            <div className="absolute left-1/4 top-0 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500/20 blur-3xl" />
            <div className="absolute right-1/4 top-0 h-48 w-48 translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/20 blur-3xl" />

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                <Zap className="h-3 w-3" />
                Khuyến mãi đặc biệt
              </span>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Khám phá toàn bộ danh mục
              </h2>
              <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-400">
                Hàng nghìn sản phẩm công nghệ chính hãng, giao hàng nhanh toàn quốc và ưu đãi mỗi ngày.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/catalog"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-slate-950 shadow-sm transition-transform hover:scale-105"
                >
                  Mua sắm ngay
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/catalog?sort=discount"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
                >
                  Xem khuyến mãi
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;