import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const initialShippingAddress: ShippingAddress = {
  fullName: "",
  phone: "",
  addressLine: "",
  ward: "",
  district: "",
  city: "",
};

function Checkout() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(initialShippingAddress);

  const updateShippingAddress = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((currentAddress) => ({
      ...currentAddress,
      [field]: value,
    }));
  };

  const handleCheckout = async () => {
    setIsSubmitting(true);

    try {
      await apiClient.post("/orders/checkout", {
        address: shippingAddress,
        paymentMethod: "COD",
      });

      ToastHelper.success("Đặt hàng thành công!");
      navigate("/dashboard");
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
                className="mt-1 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-slate-950"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Số điện thoại
              <input
                value={shippingAddress.phone}
                onChange={(event) => updateShippingAddress("phone", event.target.value)}
                className="mt-1 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-slate-950"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
              Địa chỉ
              <input
                value={shippingAddress.addressLine}
                onChange={(event) => updateShippingAddress("addressLine", event.target.value)}
                className="mt-1 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-slate-950"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Phường/Xã
              <input
                value={shippingAddress.ward}
                onChange={(event) => updateShippingAddress("ward", event.target.value)}
                className="mt-1 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-slate-950"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Quận/Huyện
              <input
                value={shippingAddress.district}
                onChange={(event) => updateShippingAddress("district", event.target.value)}
                className="mt-1 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-slate-950"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
              Tỉnh/Thành phố
              <input
                value={shippingAddress.city}
                onChange={(event) => updateShippingAddress("city", event.target.value)}
                className="mt-1 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-slate-950"
              />
            </label>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-5">
          <h2 className="text-base font-semibold text-slate-950">Phương thức thanh toán</h2>
          <div className="mt-4 space-y-3">
            <label className="flex items-start gap-3 rounded-md border border-slate-300 bg-slate-50 p-4">
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
                  Thanh toán online
                </span>
                <span className="mt-1 block text-sm text-slate-600">Tạm thời chưa khả dụng.</span>
              </span>
            </label>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCheckout}
          disabled={isSubmitting}
          className="inline-flex h-11 w-full items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? "Đang xử lý..." : "Xác nhận Đặt hàng"}
        </button>
      </div>
    </section>
  );
}

export default Checkout;
