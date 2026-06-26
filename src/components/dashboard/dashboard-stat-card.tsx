import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardStatCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
}

export default function DashboardStatCard({ label, value, icon }: DashboardStatCardProps) {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          {icon && <span className="text-gray-500">{icon}</span>}
          <span className="text-gray-400 text-xs">{label}</span>
        </div>
        <p className="text-white text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
