"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式錯誤"),
  weight: z.string().min(1, "請輸入體重").refine((v) => Number(v) > 0, "請輸入有效體重"),
  bodyFat: z.string().optional(),
  muscleMass: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BodyRecordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: { date: format(new Date(), "yyyy-MM-dd") },
    });

  async function onSubmit(values: FormValues) {
    setError(null);
    const res = await fetch("/api/body-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: values.date,
        weight: Number(values.weight),
        bodyFat: values.bodyFat ? Number(values.bodyFat) : null,
        muscleMass: values.muscleMass ? Number(values.muscleMass) : null,
        notes: values.notes ?? null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "儲存失敗，請稍後再試");
      return;
    }

    reset({ date: format(new Date(), "yyyy-MM-dd") });
    router.refresh();
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white text-base">新增量測記錄</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-gray-300 text-xs">日期</Label>
              <Input
                type="date"
                className="bg-gray-800 border-gray-700 text-white w-full"
                {...register("date")}
              />
              {errors.date && <p className="text-xs text-red-400">{errors.date.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300 text-xs">體重 kg *</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="70.5"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                {...register("weight")}
              />
              {errors.weight && <p className="text-xs text-red-400">{errors.weight.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300 text-xs">體脂率 %</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="20.0"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                {...register("bodyFat")}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300 text-xs">肌肉量 kg</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="55.0"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                {...register("muscleMass")}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-gray-300 text-xs">備註</Label>
            <Textarea
              placeholder="今天狀態..."
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 resize-none h-16"
              {...register("notes")}
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-950/40 border border-red-800 rounded px-3 py-2">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
          >
            {isSubmitting ? "儲存中..." : "新增記錄"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
