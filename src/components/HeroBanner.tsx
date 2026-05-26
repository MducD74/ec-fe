import { ArrowRight, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "../assets/hero.png";

function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-lg border border-slate-100 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
      <div className="absolute inset-0 bg-[linear-gradient(115deg,#ffffff_0%,#ffffff_42%,#eef7ff_100%)]" />
      <div className="absolute -right-24 top-8 h-72 w-72 rounded-full bg-cyan-100/50 blur-3xl" />

      <div className="relative grid min-h-[460px] items-center gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1.04fr_0.96fr] lg:px-12">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <ShoppingBag className="h-3.5 w-3.5" />
            DUT Shop cao cấp
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
            Mua sắm tinh gọn, sang trọng và thông minh hơn.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
            Khám phá những sản phẩm được chọn lọc kỹ lưỡng, ưu đãi riêng và trải nghiệm mua sắm liền mạch cho từng nhu cầu của bạn.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/catalog"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-slate-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Mua sắm ngay
              <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-sm text-slate-500">Miễn phí giao hàng cho đơn từ 499K</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
          <div className="aspect-[4/3] overflow-hidden rounded-lg border border-white bg-white shadow-2xl shadow-slate-200">
            <img
              src={heroImage}
              alt="Bộ sưu tập sản phẩm"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-5 left-5 right-5 rounded-md border border-slate-100 bg-white/95 p-4 shadow-lg backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Bộ sưu tập mới
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-950">
              Tối giản trong lựa chọn, nổi bật trong từng trải nghiệm.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;
