import { Headphones, RefreshCcw, ShieldCheck, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ServiceItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

const services: ServiceItem[] = [
  {
    title: "Giao hàng hỏa tốc",
    description: "Nhận hàng nhanh tại các khu vực hỗ trợ.",
    icon: Truck,
  },
  {
    title: "Đổi trả 7 ngày",
    description: "Linh hoạt đổi trả khi sản phẩm chưa phù hợp.",
    icon: RefreshCcw,
  },
  {
    title: "Thanh toán an toàn",
    description: "Bảo mật trong mọi phương thức thanh toán.",
    icon: ShieldCheck,
  },
  {
    title: "Hỗ trợ 24/7",
    description: "Luôn có đội ngũ hỗ trợ khi bạn cần.",
    icon: Headphones,
  },
];

function StoreServices() {
  return (
    <section className="rounded-lg border border-slate-100 bg-white px-4 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:px-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => {
          const Icon = service.icon;

          return (
            <article key={service.title} className="flex gap-4 rounded-md p-3 transition-colors hover:bg-slate-50">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-500 text-white">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-950">{service.title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">{service.description}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default StoreServices;



