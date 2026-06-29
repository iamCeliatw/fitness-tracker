import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { subDays, startOfDay } from "date-fns";
import { requireAuth } from "@/lib/auth-helpers";
import { createAdminClient } from "@/lib/supabase/server";
import BodyTrendChart from "@/components/body/body-trend-chart";
import BodyRecordForm from "@/components/body/body-record-form";
import BodyRecordList from "@/components/body/body-record-list";

interface PageProps {
  searchParams: Promise<{ range?: string }>;
}

export default async function BodyPage({ searchParams }: PageProps) {
  const user = await requireAuth();
  const { range: rangeParam } = await searchParams;
  const range = rangeParam === "30" ? 30 : 90;

  const since = startOfDay(subDays(new Date(), range));

  const admin = await createAdminClient();
  const { data: records } = await admin
    .from("BodyRecord")
    .select("*")
    .eq("userId", user.id)
    .gte("date", since.toISOString())
    .order("date", { ascending: false });

  const safeRecords = records ?? [];

  const chartRecords = safeRecords.map((r) => ({
    date: new Date(r.date).toISOString().split("T")[0],
    weight: r.weight,
    bodyFat: r.bodyFat,
  }));

  const listRecords = safeRecords.map((r) => ({
    id: r.id,
    date: new Date(r.date).toISOString().split("T")[0],
    weight: r.weight,
    bodyFat: r.bodyFat,
    muscleMass: r.muscleMass,
  }));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 text-gray-400 hover:text-gray-300 text-sm mb-4 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        總覽
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">體重追蹤</h1>
        <p className="text-gray-400 text-sm mt-1">記錄你的身體數據變化</p>
      </div>

      <div className="flex gap-2 mb-4">
        <Link
          href="/dashboard/body?range=30"
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            range === 30
              ? "bg-orange-500 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          30 天
        </Link>
        <Link
          href="/dashboard/body?range=90"
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            range === 90
              ? "bg-orange-500 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          90 天
        </Link>
      </div>

      <div className="mb-6">
        <BodyTrendChart records={chartRecords} />
      </div>

      <div className="mb-6">
        <BodyRecordForm />
      </div>

      <BodyRecordList records={listRecords} />
    </div>
  );
}
