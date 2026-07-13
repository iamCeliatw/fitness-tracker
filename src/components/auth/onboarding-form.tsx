"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const onboardingSchema = z
  .object({
    mode: z.enum(["create", "join"]),
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

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

const inputClass =
  "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500";

export default function OnboardingForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { mode: "create" },
  });
  const mode = watch("mode");

  async function onSubmit(values: OnboardingFormValues) {
    setServerError(null);

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setServerError(data?.error ?? "送出失敗，請稍後再試");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="bg-gray-900/80 border-gray-800 text-white backdrop-blur">
      <CardHeader>
        <CardTitle className="text-xl text-white">最後一步</CardTitle>
        <CardDescription className="text-gray-400">
          建立你的健身房，或用邀請碼加入
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Tabs
            value={mode}
            onValueChange={(v) =>
              setValue("mode", v as OnboardingFormValues["mode"])
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
            {isSubmitting ? "送出中..." : "完成"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
