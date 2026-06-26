"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { zhTW } from "date-fns/locale";

type ChartRecord = {
  date: string;
  weight: number | null;
  bodyFat: number | null;
};

interface BodyTrendChartProps {
  records: ChartRecord[];
}

export default function BodyTrendChart({ records }: BodyTrendChartProps) {
  if (records.length < 2) {
    return (
      <div className="flex items-center justify-center h-48 rounded-lg border border-gray-800 bg-gray-900/50">
        <p className="text-gray-500 text-sm">記錄 2 筆以上數據後將顯示趨勢圖</p>
      </div>
    );
  }

  const chartData = [...records]
    .reverse()
    .map((r) => ({
      date: format(parseISO(r.date), "MM/dd", { locale: zhTW }),
      體重: r.weight,
      體脂率: r.bodyFat,
    }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 11 }} />
          <YAxis
            yAxisId="weight"
            orientation="left"
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            unit=" kg"
            domain={["auto", "auto"]}
          />
          <YAxis
            yAxisId="bodyFat"
            orientation="right"
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            unit="%"
            domain={["auto", "auto"]}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
            labelStyle={{ color: "#f9fafb" }}
            itemStyle={{ color: "#d1d5db" }}
          />
          <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12 }} />
          <Line
            yAxisId="weight"
            type="monotone"
            dataKey="體重"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ fill: "#f97316", r: 3 }}
            connectNulls
          />
          <Line
            yAxisId="bodyFat"
            type="monotone"
            dataKey="體脂率"
            stroke="#60a5fa"
            strokeWidth={2}
            dot={{ fill: "#60a5fa", r: 3 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
