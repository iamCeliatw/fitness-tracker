"use client";

import { useState } from "react";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { Calendar, Clock, User, X } from "lucide-react";
import { useRouter } from "next/navigation";

type Appointment = {
  id: string;
  status: string;
  notes: string | null;
  slot: { id: string; startTime: string; endTime: string } | null;
  coach: { id: string; name: string | null } | null;
};

export default function MyAppointmentList({ appointments }: { appointments: Appointment[] }) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState<string | null>(null);

  if (appointments.length === 0) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center text-gray-500">
        目前沒有預約記錄
      </div>
    );
  }

  async function handleCancel(id: string) {
    setCancelling(id);
    try {
      await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setCancelling(null);
    }
  }

  return (
    <div className="space-y-3">
      {appointments.map((apt) => {
        const slot = apt.slot;
        return (
          <div
            key={apt.id}
            className="rounded-lg border border-gray-800 bg-gray-900 p-4 flex items-center justify-between gap-4 transition-colors duration-150 hover:border-gray-700"
          >
            <div className="flex flex-col gap-1 min-w-0">
              {slot && (
                <>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>{format(new Date(slot.startTime), "M月d日 (EEE)", { locale: zhTW })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>
                      {format(new Date(slot.startTime), "HH:mm")}–{format(new Date(slot.endTime), "HH:mm")}
                    </span>
                  </div>
                </>
              )}
              {apt.coach && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="w-4 h-4 shrink-0" />
                  <span>{apt.coach.name ?? "教練"}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => handleCancel(apt.id)}
              disabled={cancelling === apt.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-gray-400 border border-gray-700 hover:border-red-700 hover:text-red-400 transition-colors disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
              {cancelling === apt.id ? "取消中…" : "取消"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
