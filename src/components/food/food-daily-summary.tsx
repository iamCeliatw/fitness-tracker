"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface FoodEntry {
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}

const MACRO_COLORS = {
  protein: "#f97316",  // orange-500
  carbs: "#3b82f6",    // blue-500
  fat: "#a855f7",      // purple-500
};

export default function FoodDailySummary({ entries }: { entries: FoodEntry[] }) {
  const totalCalories = entries.reduce((s, e) => s + e.calories, 0);
  const totalProtein = entries.reduce((s, e) => s + (e.protein ?? 0), 0);
  const totalCarbs = entries.reduce((s, e) => s + (e.carbs ?? 0), 0);
  const totalFat = entries.reduce((s, e) => s + (e.fat ?? 0), 0);

  const hasMacros = totalProtein > 0 || totalCarbs > 0 || totalFat > 0;

  const pieData = [
    { name: "蛋白質", value: Math.round(totalProtein * 10) / 10, color: MACRO_COLORS.protein },
    { name: "碳水", value: Math.round(totalCarbs * 10) / 10, color: MACRO_COLORS.carbs },
    { name: "脂肪", value: Math.round(totalFat * 10) / 10, color: MACRO_COLORS.fat },
  ].filter((d) => d.value > 0);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: "熱量", value: `${Math.round(totalCalories)}`, unit: "kcal" },
          { label: "蛋白質", value: `${Math.round(totalProtein * 10) / 10}`, unit: "g" },
          { label: "碳水", value: `${Math.round(totalCarbs * 10) / 10}`, unit: "g" },
          { label: "脂肪", value: `${Math.round(totalFat * 10) / 10}`, unit: "g" },
        ].map(({ label, value, unit }) => (
          <div key={label} className="text-center">
            <p className="text-xs text-gray-500 mb-0.5">{label}</p>
            <p className="text-lg font-semibold text-white leading-none">{value}</p>
            <p className="text-xs text-gray-600">{unit}</p>
          </div>
        ))}
      </div>

      {/* Pie chart */}
      {hasMacros ? (
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={58}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value}g`, name]}
                contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px", color: "#fff" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-1">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-gray-400">{d.name} {d.value}g</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-600 text-xs text-center py-4">尚無營養素資料</p>
      )}
    </div>
  );
}
