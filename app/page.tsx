"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Button } from "@/components";
import { Mail, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ROLE_ROUTES, type UserRole } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "PROIN";
const APP_TAGLINE =
  process.env.NEXT_PUBLIC_APP_TAGLINE || "Asset Management System";

export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setAuthError(null);

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setAuthError(error.message);
      setIsLoading(false);
      return;
    }

    if (authData.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      const role = (profile?.role as UserRole) || "TECH";
      const dashboardUrl = ROLE_ROUTES[role] || "/tech";

      router.push(dashboardUrl);
      router.refresh();
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex">
      <div className="hidden lg:flex lg:w-[52%] bg-[#18181b] p-12 lg:p-16 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold tracking-tight text-white">
              {APP_NAME}
            </span>
          </div>
        </div>
        <div className="relative z-10 max-w-lg">
          <h1 className="text-6xl lg:text-7xl font-semibold tracking-tight leading-[0.95] text-white mb-8">
            <span className="text-[#ffffff]">Create.</span>
            <br />
            <span className="text-[#bfbfbf]">Manage.</span>
            <br />
            <span className="text-[#71717a]">Inspire.</span>
          </h1>
          <p className="text-[#71717a] text-base leading-relaxed max-w-sm">
            {APP_TAGLINE}
          </p>
        </div>
        <div className="relative z-10 flex items-center justify-between text-xs text-[#52525b] font-medium">
          <span>© Copyright 2026 | {APP_NAME}</span>
          <div className="flex gap-6">
            <span>Inventory</span>
            <span>Projects</span>
            <span>Deployment</span>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[48%] bg-white flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-sm">
          <div className="mb-12">
            <h2 className="text-2xl font-semibold tracking-tight text-[#18181b] mb-3">
              Sign in
            </h2>
            <p className="text-[#71717a] text-sm">
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              {...register("email")}
              type="email"
              id="email"
              label="Email"
              placeholder="name@company.com"
              icon={<Mail className="w-[18px] h-[18px]" />}
              error={errors.email?.message}
            />

            <Input
              {...register("password")}
              type="password"
              id="password"
              label="Password"
              placeholder="••••••••"
              icon={<Lock className="w-[18px] h-[18px]" />}
              error={errors.password?.message}
            />

            {authError && <p className="text-xs text-red-500">{authError}</p>}

            <Button type="submit" loading={isLoading} className="w-full">
              Continue
            </Button>

            <p className="text-center text-xs text-[#a1a1aa]">
              Secured by Supabase Auth
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
