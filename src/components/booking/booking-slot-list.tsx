"use client";

import { useState } from "react";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { Calendar, Clock, User } from "lucide-react";
import { useRouter } from "next/navigation";

type Slot = {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  coach: { id: string; name: string | null } | null;
};

export default function BookingSlotList({
  slots,
  cutoffHours,
}: {
  slots: Slot[];
  cutoffHours: number;
}) {
  const router = useRouter();
  const [booking, setBooking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (slots.length === 0) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center text-gray-500">
        目前沒有可預約的時段
      </div>
    );
  }

  async function handleBook(slotId: string) {
    setBooking(slotId);
    setError(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "預約失敗");
      } else {
        router.refresh();
      }
    } catch {
      setError("網路錯誤，請稍後再試");
    } finally {
      setBooking(null);
    }
  }

  const now = Date.now();
  const cutoffMs = cutoffHours * 60 * 60 * 1000;

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-md bg-red-900/40 border border-red-700 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}
      {slots.map((slot) => {
        const isPastCutoff = new Date(slot.startTime).getTime() - now < cutoffMs;
        return (
          <div
            key={slot.id}
            className="rounded-lg border border-gray-800 bg-gray-900 p-4 flex items-center justify-between gap-4 transition-colors duration-150 hover:border-gray-700"
          >
            <div className="flex flex-col gap-1 min-w-0">
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
              {slot.coach && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="w-4 h-4 shrink-0" />
                  <span>{slot.coach.name ?? "教練"}</span>
                </div>
              )}
            </div>
            <div className="relative group shrink-0">
              <button
                onClick={() => handleBook(slot.id)}
                disabled={isPastCutoff || booking === slot.id}
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {booking === slot.id ? "預約中…" : "預約"}
              </button>
              {isPastCutoff && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  距開課不足 {cutoffHours} 小時，無法預約
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
