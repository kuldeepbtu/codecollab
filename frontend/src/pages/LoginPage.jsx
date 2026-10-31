import { Link, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
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

  const { login, signup, user } = useAuth();
  const [demoCredentials, setDemoCredentials] = useState(null);
  const [demoLoading, setDemoLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleDemoLogin = async () => {
    if (demoLoading) return;

    setDemoLoading(true);
    const suffix = `${Date.now().toString(36)}${crypto.randomUUID().slice(0, 8)}`;
    const credentials = {
      name: "CodeCollab Demo Guest",
      email: `guest-${suffix}@codecollab-demo.com`,
      password: `Guest@${crypto.randomUUID().slice(0, 12)}`,
    };

    try {
      await signup(credentials.name, credentials.email, credentials.password);
      setDemoCredentials({
        email: credentials.email,
        password: credentials.password,
      });
      toast.success("Demo account created. You are now logged in!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          (err?.code === "ERR_NETWORK"
            ? "Cannot connect to the CodeCollab backend."
            : "Could not create a demo account. Please try again.")
      );
    } finally {
      setDemoLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);

      toast.success("Login Successful!");

      navigate("/dashboard");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || (err?.code === "ERR_NETWORK" ? "Cannot connect to backend server (http://localhost:5000)" : "Login Failed")
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">

      <Card>

        <h1 className="mb-2 text-center text-4xl font-bold">
          CodeCollab
        </h1>

        <p className="mb-8 text-center text-slate-400">
          Welcome Back 👋
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 w-[380px]"
        >
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
          <Link
            to="/signup"
            className="text-blue-500 hover:underline"
          >
            Signup
          </Link>
        </p>

      </Card>
    </div>
  );
}

export default LoginPage;