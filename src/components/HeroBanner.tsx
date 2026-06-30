import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface BannerSlide {
  id: number;
  tag: string;
  title: string;
  titleHighlight?: string;
  description: string;
  ctaLabel: string;
  ctaTo: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryTo?: string;
  /** Tailwind gradient classes for the bg */
  bgGradient: string;
  /** Left accent color — used on the eyebrow tag */
  accentClass: string;
  /** Image path — replace with real assets; undefined = gradient only */
  image?: string;
  imageAlt?: string;
  /** Text alignment */
  align?: "left" | "right";
}

const SLIDES: BannerSlide[] = [
  {
    id: 1,
    tag: "Ra mắt mới nhất",
    title: "iPhone 16 Pro Max",
    titleHighlight: "Titan. Mỏng hơn. Mạnh hơn.",
    description:
      "Chip A18 Pro thế hệ mới, camera 48MP Fusion và màn hình ProMotion 120Hz đỉnh cao. Công nghệ đỉnh cao trong lòng bàn tay.",
    ctaLabel: "Mua ngay",
    ctaTo: "/catalog?q=iphone-16-pro",
    ctaSecondaryLabel: "So sánh dòng",
    ctaSecondaryTo: "/catalog?category=iphone",
    bgGradient:
      "bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_45%,#0c1a2e_100%)]",
    accentClass: "bg-sky-400 text-sky-400",
    align: "left",
  },
  {
    id: 2,
    tag: "Samsung Galaxy",
    title: "Galaxy S25 Ultra",
    titleHighlight: "AI trong từng khoảnh khắc.",
    description:
      "Galaxy AI đã nâng tầm — viết, tóm tắt, dịch và sáng tạo nội dung ngay trên thiết bị, không cần kết nối.",
    ctaLabel: "Khám phá",
    ctaTo: "/catalog?q=galaxy-s25",
    ctaSecondaryLabel: "Xem tất cả Samsung",
    ctaSecondaryTo: "/catalog?brand=samsung",
    bgGradient:
      "bg-[linear-gradient(135deg,#312e81_0%,#1e3a5f_50%,#0f2027_100%)]",
    accentClass: "bg-violet-400 text-violet-400",
    align: "right",
  },
  {
    id: 3,
    tag: "Laptop Gaming",
    title: "ASUS ROG Zephyrus",
    titleHighlight: "Thống trị từng trận chiến.",
    description:
      "RTX 4080 Super, màn hình 240Hz QHD, tản nhiệt MUX Switch cho hiệu năng không giới hạn. Chiến đấu ở đẳng cấp cao nhất.",
    ctaLabel: "Xem laptop gaming",
    ctaTo: "/catalog?category=laptop-gaming",
    bgGradient:
      "bg-[linear-gradient(135deg,#0d0d0d_0%,#1a0a0a_40%,#2d0a0a_100%)]",
    accentClass: "bg-red-500 text-red-500",
    align: "left",
  },
  {
    id: 4,
    tag: "Flash Sale • Hôm nay",
    title: "Giảm đến 40%",
    titleHighlight: "Tai nghe & Phụ kiện",
    description:
      "AirPods Pro 2, Sony WH-1000XM5, JBL Quantum — giảm mạnh chỉ trong hôm nay. Số lượng có hạn, nhanh tay kẻo hết.",
    ctaLabel: "Xem ưu đãi",
    ctaTo: "/catalog?sort=discount",
    bgGradient:
      "bg-[linear-gradient(135deg,#064e3b_0%,#065f46_45%,#022c22_100%)]",
    accentClass: "bg-emerald-400 text-emerald-400",
    align: "left",
  },
  {
    id: 5,
    tag: "Đặc quyền DUT Shop",
    title: "Trả góp 0%",
    titleHighlight: "Lên đến 24 tháng.",
    description:
      "Mua ngay — trả sau không lãi suất với thẻ tín dụng các ngân hàng lớn. Miễn phí giao hàng toàn quốc cho đơn từ 499K.",
    ctaLabel: "Điều kiện áp dụng",
    ctaTo: "/installment",
    ctaSecondaryLabel: "Mua sắm ngay",
    ctaSecondaryTo: "/catalog",
    bgGradient:
      "bg-[linear-gradient(135deg,#78350f_0%,#92400e_45%,#451a03_100%)]",
    accentClass: "bg-amber-400 text-amber-400",
    align: "right",
  },
  {
    id: 6,
    tag: "Mới về kho",
    title: "MacBook Pro M4",
    titleHighlight: "Chip M4 Pro — hiệu năng AI.",
    description:
      "Neural Engine 40 nhân, thời lượng pin 22 giờ và màn hình Liquid Retina XDR. Máy tính xách tay mạnh nhất lịch sử Apple.",
    ctaLabel: "Khám phá",
    ctaTo: "/catalog?q=macbook-m4",
    ctaSecondaryLabel: "So sánh chip M",
    ctaSecondaryTo: "/catalog?category=macbook",
    bgGradient:
      "bg-[linear-gradient(135deg,#1c1917_0%,#292524_50%,#0c0a09_100%)]",
    accentClass: "bg-slate-300 text-slate-300",
    align: "left",
  },
];

const AUTOPLAY_MS = 4500;

function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  // Touch/drag state
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isDragging = useRef(false);

  const total = SLIDES.length;

  const goTo = useCallback((index: number) => {
    setCurrent(((index % total) + total) % total);
    setProgress(0);
  }, [total]);

  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);
  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);

  // Progress bar + autoplay
  useEffect(() => {
    if (isPaused) return;

    const intervalMs = 50;
    const step = (intervalMs / AUTOPLAY_MS) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPaused, goNext]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dx > dy && dx > 8) isDragging.current = true;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current || touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx < -40) goNext();
    else if (dx > 40) goPrev();
    touchStartX.current = null;
    isDragging.current = false;
  };

  return (
    <div
      className="relative select-none overflow-hidden rounded-2xl"
      style={{ minHeight: "420px" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Slide track ────────────────────────────────── */}
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {SLIDES.map((s) => (
          <SlidePanel key={s.id} slide={s} />
        ))}
      </div>

      {/* ── Prev / Next buttons ─────────────────────────── */}
      <button
        onClick={goPrev}
        aria-label="Slide trước"
        className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/50 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:left-4 sm:h-11 sm:w-11"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={goNext}
        aria-label="Slide tiếp theo"
        className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/50 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:right-4 sm:h-11 sm:w-11"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* ── Indicators + progress ───────────────────────── */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:bottom-5">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            aria-label={`Chuyển đến slide ${i + 1}`}
            className="relative h-1.5 overflow-hidden rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            style={{ width: i === current ? "32px" : "8px" }}
          >
            {/* track */}
            <span className="absolute inset-0 rounded-full bg-white/30" />
            {/* fill */}
            {i === current && (
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-white"
                style={{ width: `${progress}%`, transition: "width 50ms linear" }}
              />
            )}
            {i !== current && (
              <span className="absolute inset-0 rounded-full bg-white/30" />
            )}
          </button>
        ))}
      </div>

      {/* ── Slide counter ───────────────────────────────── */}
      <div className="absolute right-4 top-4 z-20 rounded-full bg-black/25 px-2.5 py-0.5 text-xs font-semibold text-white/80 backdrop-blur-sm">
        {current + 1} / {total}
      </div>
    </div>
  );
}

/* ── Individual slide panel ────────────────────────────────── */
function SlidePanel({ slide }: { slide: BannerSlide }) {
  const isRight = slide.align === "right";

  return (
    <div
      className={`relative flex w-full shrink-0 items-center overflow-hidden ${slide.bgGradient}`}
      style={{ minHeight: "420px" }}
    >
      {/* Subtle noise texture overlay for depth */}
      <div className="absolute inset-0 opacity-[0.03] [background-image:url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20256%20256%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noise%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.9%22%20numOctaves%3D%224%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noise)%22%2F%3E%3C%2Fsvg%3E')]" />

      {/* Decorative glow blob */}
      <div
        className={`pointer-events-none absolute h-80 w-80 rounded-full blur-[100px] opacity-20 ${
          isRight ? "left-8 top-1/2 -translate-y-1/2" : "right-8 top-1/2 -translate-y-1/2"
        }`}
        style={{ background: "white" }}
      />

      {/* Image area (right or left depending on align) */}
      {slide.image ? (
        <div
          className={`absolute inset-y-0 w-1/2 ${isRight ? "left-0" : "right-0"} pointer-events-none`}
        >
          <img
            src={slide.image}
            alt={slide.imageAlt ?? slide.title}
            className="h-full w-full object-cover opacity-80"
            loading="eager"
          />
          {/* fade towards content side */}
          <div
            className={`absolute inset-y-0 w-2/3 ${
              isRight
                ? "right-0 bg-gradient-to-l"
                : "left-0 bg-gradient-to-r"
            } from-transparent to-[rgba(0,0,0,0.8)]`}
          />
        </div>
      ) : (
        /* Placeholder geometric when no image */
        <div
          className={`pointer-events-none absolute inset-y-0 flex items-center justify-center ${
            isRight ? "left-0 w-1/2" : "right-0 w-1/2"
          } opacity-10`}
        >
          <div className="h-64 w-64 rounded-full border-[40px] border-white" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <div
          className={`max-w-lg ${isRight ? "ml-auto" : ""}`}
        >
          {/* Tag / eyebrow */}
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/80 backdrop-blur-sm">
            <span
              className={`h-1.5 w-1.5 rounded-full ${slide.accentClass.split(" ")[0]}`}
            />
            {slide.tag}
          </span>

          {/* Title */}
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            {slide.title}
          </h1>
          {slide.titleHighlight && (
            <p className={`mt-1 text-2xl font-semibold sm:text-3xl lg:text-4xl ${slide.accentClass.split(" ")[1]}`}>
              {slide.titleHighlight}
            </p>
          )}

          {/* Description */}
          <p className="mt-4 max-w-sm text-sm leading-7 text-white/65 sm:text-base">
            {slide.description}
          </p>

          {/* CTAs */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to={slide.ctaTo}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-slate-950 shadow-lg transition-transform hover:scale-105"
            >
              {slide.ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
            {slide.ctaSecondaryLabel && slide.ctaSecondaryTo && (
              <Link
                to={slide.ctaSecondaryTo}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15"
              >
                {slide.ctaSecondaryLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroBanner;



