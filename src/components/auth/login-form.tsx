"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";
import GoogleLoginButton from "@/components/auth/google-login-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const loginSchema = z.object({
  email: z.string().email("請輸入有效的 Email"),
  password: z.string().min(1, "請輸入密碼"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "true";
  const oauthError = searchParams.get("error") === "oauth";
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginFormValues) {
    setLoginError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setLoginError("Email 或密碼錯誤");
      return;
    }

    // Get role to determine redirect target
    const res = await fetch("/api/auth/me");
    const data = await res.json();

    if (data.role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
    router.refresh();
  }

  return (
    <Card className="bg-gray-900/80 border-gray-800 text-white backdrop-blur py-8">
      <CardHeader className="px-8">
        <CardTitle className="text-2xl text-white">登入</CardTitle>
        <CardDescription className="text-gray-400 text-[15px] mt-1">
          繼續你的訓練計畫
        </CardDescription>
      </CardHeader>

      <CardContent className="px-8">
        {registered && (
          <div className="mb-4 text-sm text-green-400 bg-green-950/40 border border-green-800 rounded-md px-3 py-2">
            帳號建立成功，請登入
          </div>
        )}

        {oauthError && (
          <div className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-800 rounded-md px-3 py-2">
            Google 登入失敗，請再試一次
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300 text-[15px]">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="h-11 px-4 text-base md:text-base bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300 text-[15px]">
              密碼
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••"
              className="h-11 px-4 text-base md:text-base bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          {loginError && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-800 rounded-md px-3 py-2">
              {loginError}
            </p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 text-base bg-orange-500 hover:bg-orange-600 text-white font-semibold mt-2"
          >
            {isSubmitting ? "登入中..." : "登入"}
          </Button>
        </form>

        <GoogleLoginButton label="使用 Google 登入" />
      </CardContent>

      <CardFooter className="justify-center px-8">
        <p className="text-[15px] text-gray-400">
          還沒有帳號？{" "}
          <Link
            href="/register"
            className="text-orange-400 hover:text-orange-300 font-medium"
          >
            前往註冊
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
