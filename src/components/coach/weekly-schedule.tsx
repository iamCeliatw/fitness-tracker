"use client";

import { useState } from "react";
import { endOfWeek, format, startOfWeek } from "date-fns";
import { zhTW } from "date-fns/locale";
import { Clock, User, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

type SlotAppointment = {
  id: string;
  status: string;
  studentId: string;
  student: { id: string; name: string | null } | null;
};

type Slot = {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  appointment: SlotAppointment | null;
};

export default function WeeklySchedule({
  slots,
  coachId,
}: {
  slots: Slot[];
  coachId: string;
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleAddSlot() {
    if (!startTime || !endTime) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "新增失敗");
      } else {
        // 面板只顯示本週，非本週的新增要明確告知，避免看起來像沒成功
        const slotStart = new Date(startTime);
        const now = new Date();
        const inCurrentWeek =
          slotStart >= startOfWeek(now, { weekStartsOn: 1 }) &&
          slotStart <= endOfWeek(now, { weekStartsOn: 1 });
        setSuccess(
          inCurrentWeek
            ? "時段已新增"
            : "時段已新增（不在本週範圍，未顯示於下方列表）"
        );
        setShowForm(false);
        setStartTime("");
        setEndTime("");
        router.refresh();
      }
    } catch {
      setError("網路錯誤，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      {success && (
        <div className="rounded-lg border border-green-800 bg-green-900/30 px-3 py-2 text-sm text-green-300">
          {success}
        </div>
      )}

      {slots.length === 0 && !showForm && (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center text-gray-500">
          本週尚無排課
        </div>
      )}

      {slots.map((slot) => {
        const isPast = new Date(slot.endTime) < new Date();
        const student = slot.appointment?.student;
        const isPending = slot.appointment?.status === "PENDING";
        return (
          <div
            key={slot.id}
            className={`rounded-lg border bg-gray-900 p-4 transition-colors duration-150 ${
              isPast
                ? "border-gray-800 opacity-60 hover:border-gray-700"
                : isPending
                  ? "border-orange-400/40 hover:border-orange-400/70"
                  : "border-gray-700 hover:border-gray-600"
            }`}
          >
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
              <Clock className="w-4 h-4 shrink-0" />
              <span>
                {format(new Date(slot.startTime), "M月d日 (EEE) HH:mm", { locale: zhTW })}–
                {format(new Date(slot.endTime), "HH:mm")}
              </span>
              {isPending && (
                <span className="ml-auto px-2 py-0.5 rounded-full border border-orange-400/40 bg-orange-400/10 text-xs text-orange-400">
                  待確認
                </span>
              )}
            </div>
            {student ? (
              <div className="flex items-center gap-2 text-sm text-gray-300 pl-6">
                <User className="w-3.5 h-3.5 shrink-0" />
                <span>{student.name ?? "學員"}</span>
              </div>
            ) : (
              <div className="pl-6 text-sm text-gray-600">待預約</div>
            )}
          </div>
        );
      })}

      {showForm && (
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-4 space-y-3">
          {error && (
            <div className="rounded bg-red-900/40 border border-red-700 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">開始時間</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">結束時間</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setShowForm(false); setError(null); }}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleAddSlot}
              disabled={submitting || !startTime || !endTime}
              className="px-4 py-1.5 rounded-md text-sm bg-blue-600 hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              {submitting ? "新增中…" : "確認新增"}
            </button>
          </div>
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => {
            setShowForm(true);
            setSuccess(null);
          }}
          className="w-full rounded-lg border border-dashed border-gray-700 bg-gray-900/50 py-3 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-300 hover:border-gray-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增時段
        </button>
      )}
    </div>
  );
}
