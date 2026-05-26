import { useEffect, useState } from "react";
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
    <div className="space-y-14 pb-10 pt-2 sm:space-y-16">
      <HeroBanner />
      <StoreServices />
      <VoucherList vouchers={vouchers} copiedCode={copiedCode} onCopyCode={handleCopyCode} />
      <AiRecommendations />
      <TrendingProducts />
    </div>
  );
}

export default Home;
