import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../lib/api-client";
import { ToastHelper } from "../lib/toast-helper";

function Checkout() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = async () => {
    setIsSubmitting(true);

    try {
      await apiClient.post("/checkout");
      ToastHelper.success("Dat hang thanh cong");
      navigate("/dashboard");
    } catch {
      ToastHelper.error("Dat hang that bai");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-xl py-8">
      <h1 className="text-2xl font-semibold tracking-normal text-slate-950">Checkout</h1>
      <p className="mt-2 text-sm text-slate-600">
        Xac nhan gio hang hien tai de tao don hang va cap nhat ton kho.
      </p>

      <div className="mt-6 rounded-md border border-slate-200 bg-white p-4">
        <button
          type="button"
          onClick={handleCheckout}
          disabled={isSubmitting}
          className="inline-flex h-11 w-full items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? "Dang xu ly..." : "Chot don"}
        </button>
      </div>
    </section>
  );
}

export default Checkout;
