"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const registerSchema = z
  .object({
    mode: z.enum(["create", "join"]),
    name: z.string().min(1, "姓名為必填"),
    email: z.string().email("請輸入有效的 Email"),
    password: z.string().min(6, "密碼至少 6 個字元"),
    orgName: z.string().optional(),
    inviteCode: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "create" && !data.orgName?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["orgName"],
        message: "健身房名稱為必填",
      });
    }
    if (data.mode === "join" && !data.inviteCode?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["inviteCode"],
        message: "邀請碼為必填",
      });
    }
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const inputClass =
  "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500";

export default function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { mode: "create" },
  });
  const mode = watch("mode");

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setServerError(data?.error ?? "註冊失敗，請稍後再試");
      return;
    }

    router.push("/login?registered=true");
  }

  return (
    <Card className="bg-gray-900/80 border-gray-800 text-white backdrop-blur">
      <CardHeader>
        <CardTitle className="text-xl text-white">建立帳號</CardTitle>
        <CardDescription className="text-gray-400">
          開始追蹤你的訓練旅程
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-gray-300">
              姓名
            </Label>
            <Input
              id="name"
              placeholder="你的名字"
              className={inputClass}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-gray-300">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className={inputClass}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-gray-300">
              密碼
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="至少 6 個字元"
              className={inputClass}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          <Tabs
            value={mode}
            onValueChange={(v) =>
              setValue("mode", v as RegisterFormValues["mode"])
            }
          >
            <TabsList className="w-full bg-gray-800">
              <TabsTrigger value="create" className="flex-1 transition-colors">
                建立健身房
              </TabsTrigger>
              <TabsTrigger value="join" className="flex-1 transition-colors">
                我有邀請碼
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="orgName" className="text-gray-300">
                  健身房名稱
                </Label>
                <Input
                  id="orgName"
                  placeholder="你的健身房"
                  className={inputClass}
                  {...register("orgName")}
                />
                <p className="text-xs text-gray-500">
                  你將成為這間健身房的管理者
                </p>
                {errors.orgName && (
                  <p className="text-xs text-red-400">
                    {errors.orgName.message}
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="join" className="pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="inviteCode" className="text-gray-300">
                  邀請碼
                </Label>
                <Input
                  id="inviteCode"
                  placeholder="8 碼邀請碼"
                  className={`${inputClass} uppercase`}
                  {...register("inviteCode")}
                />
                {errors.inviteCode && (
                  <p className="text-xs text-red-400">
                    {errors.inviteCode.message}
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {serverError && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-800 rounded-md px-3 py-2">
              {serverError}
            </p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold mt-2 transition-colors"
          >
            {isSubmitting ? "建立中..." : "建立帳號"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-gray-400">
          已有帳號？{" "}
          <Link
            href="/login"
            className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
          >
            前往登入
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
