import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import apiClient from "../lib/api-client";
import { ToastHelper } from "../lib/toast-helper";

const loginSchema = z.object({
  email: z.email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface AuthResponse {
  token: string;
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "Đăng nhập thất bại";
  }

  return "Đăng nhập thất bại";
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
      ToastHelper.success("Đăng nhập thành công");
      navigate("/");
    } catch (error) {
      ToastHelper.error(getErrorMessage(error));
    }
  };

  return (
    <section className="mx-auto max-w-md py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-normal text-slate-950">Đăng nhập</h1>
        <p className="mt-2 text-sm text-slate-600">
          Nhập thông tin tài khoản để tiếp tục mua sắm.
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
            className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-primary-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
            Mật khẩu
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-primary-600">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full rounded-md bg-primary-500 px-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        Chưa có tài khoản?{" "}
        <Link className="font-semibold text-primary-600 hover:underline" to="/register">
          Đăng ký
        </Link>
      </p>
    </section>
  );
}

export default Login;



