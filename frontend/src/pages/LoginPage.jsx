import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

import { useAuth } from "../contexts/AuthContext";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

function LoginPage() {
  const navigate = useNavigate();

  const { login, user } = useAuth();
  const demoEmail = "demo@codecollab.app";
  const demoPassword = "Demo@123456";

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const fillDemoCredentials = () => {
    setValue("email", demoEmail, { shouldValidate: true });
    setValue("password", demoPassword, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      toast.success("Login Successful!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          (err?.code === "ERR_NETWORK"
            ? "Cannot reach the CodeCollab backend. Please try again shortly."
            : "Login Failed")
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <Card>
        <h1 className="mb-2 text-center text-4xl font-bold">CodeCollab</h1>
        <p className="mb-8 text-center text-slate-400">Welcome Back 👋</p>

        <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
          <p className="mb-2 text-sm font-semibold text-blue-300">Example demo login</p>
          <div className="space-y-1 rounded-lg bg-slate-900 p-3 text-xs text-slate-300">
            <p><span className="text-slate-500">Email:</span> {demoEmail}</p>
            <p><span className="text-slate-500">Password:</span> {demoPassword}</p>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-amber-300">
            Sample credentials only. The demo user must be created in the backend database before these details can authenticate.
          </p>
          <Button type="button" onClick={fillDemoCredentials} className="mt-3">
            Fill Demo Credentials
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 w-[380px]">
          <Input
            label="Email"
            type="email"
            placeholder="Enter Email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter Password"
            error={errors.password?.message}
            {...register("password")}
          />
          <Button type="submit">
            {isSubmitting ? "Logging In..." : "Login"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Signup
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default LoginPage;
