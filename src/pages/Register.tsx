import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import apiClient from "../lib/api-client";
import { ToastHelper } from "../lib/toast-helper";

const registerSchema = z.object({
  name: z.string().min(2, "Ten phai co it nhat 2 ky tu"),
  email: z.email("Email khong hop le"),
  password: z.string().min(6, "Mat khau phai co it nhat 6 ky tu"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface AuthResponse {
  token: string;
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "Dang ky that bai";
  }

  return "Dang ky that bai";
}

function Register() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const response = await apiClient.post<AuthResponse>("/auth/register", values);

      window.localStorage.setItem("access_token", response.data.token);
      window.dispatchEvent(new Event("auth-token-changed"));
      ToastHelper.success("Dang ky thanh cong");
      navigate("/");
    } catch (error) {
      ToastHelper.error(getErrorMessage(error));
    }
  };

  return (
    <section className="mx-auto max-w-md py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-normal text-slate-950">Dang ky</h1>
        <p className="mt-2 text-sm text-slate-600">
          Tao tai khoan de luu gio hang va nhan goi y phu hop hon.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="name">
            Ho ten
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition-colors focus:border-slate-950"
            {...register("name")}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition-colors focus:border-slate-950"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
            Mat khau
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition-colors focus:border-slate-950"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? "Dang xu ly..." : "Dang ky"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        Da co tai khoan?{" "}
        <Link className="font-medium text-slate-950 hover:underline" to="/login">
          Dang nhap
        </Link>
      </p>
    </section>
  );
}

export default Register;
