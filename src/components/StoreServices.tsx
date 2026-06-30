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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {services.map((service) => {
        const Icon = service.icon;

        return (
          <article
            key={service.title}
            className="flex gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition-shadow hover:shadow-md"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-500 text-white">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-950">{service.title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">{service.description}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default StoreServices;