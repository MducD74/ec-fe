import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import apiClient from "../lib/api-client";
import { ToastHelper } from "../lib/toast-helper";

const loginSchema = z.object({
  email: z.email("Email khong hop le"),
  password: z.string().min(6, "Mat khau phai co it nhat 6 ky tu"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface AuthResponse {
  token: string;
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "Dang nhap that bai";
  }

  return "Dang nhap that bai";
}

function Login() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response = await apiClient.post<AuthResponse>("/auth/login", values);

      window.localStorage.setItem("access_token", response.data.token);
      window.dispatchEvent(new Event("auth-token-changed"));
      ToastHelper.success("Dang nhap thanh cong");
      navigate("/");
    } catch (error) {
      ToastHelper.error(getErrorMessage(error));
    }
  };

  return (
    <section className="mx-auto max-w-md py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-normal text-slate-950">Dang nhap</h1>
        <p className="mt-2 text-sm text-slate-600">
          Nhap thong tin tai khoan de tiep tuc mua sam.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
            autoComplete="current-password"
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
          {isSubmitting ? "Dang xu ly..." : "Dang nhap"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        Chua co tai khoan?{" "}
        <Link className="font-medium text-slate-950 hover:underline" to="/register">
          Dang ky
        </Link>
      </p>
    </section>
  );
}

export default Login;
