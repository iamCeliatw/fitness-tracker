"use client";

import { useState } from "react";
import { endOfWeek, format, startOfWeek } from "date-fns";
import { zhTW } from "date-fns/locale";
import { Clock, User, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

// 週幾 chips 依台灣習慣一~日排序；value 對應 JS getDay()（0 = 週日）
const WEEKDAYS = [
  { label: "一", value: 1 },
  { label: "二", value: 2 },
  { label: "三", value: 3 },
  { label: "四", value: 4 },
  { label: "五", value: 5 },
  { label: "六", value: 6 },
  { label: "日", value: 0 },
];

const BATCH_CAP = 84; // 12 週 × 7 天，與 API 上限一致

/** 週幾 + 時間 + 日期區間 → 具體開始時間清單（略過已過去的時間點） */
function expandRecurring(weekdays: number[], time: string, from: string, to: string): Date[] {
  if (weekdays.length === 0 || !time || !from || !to || from > to) return [];
  const [h, m] = time.split(":").map(Number);
  const now = new Date();
  const end = new Date(`${to}T23:59:59`);
  const out: Date[] = [];
  for (const d = new Date(`${from}T00:00:00`); d <= end; d.setDate(d.getDate() + 1)) {
    if (!weekdays.includes(d.getDay())) continue;
    const s = new Date(d);
    s.setHours(h, m, 0, 0);
    if (s > now) out.push(s);
  }
  return out;
}

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
  weekStartIso,
}: {
  slots: Slot[];
  coachId: string;
  weekStartIso?: string;
}) {
  // 面板顯示的週（可能經導覽切換），提示與空狀態都以此為準
  const viewStart = weekStartIso
    ? new Date(weekStartIso)
    : startOfWeek(new Date(), { weekStartsOn: 1 });
  const viewEnd = endOfWeek(viewStart, { weekStartsOn: 1 });
  const isCurrentWeek =
    viewStart.getTime() === startOfWeek(new Date(), { weekStartsOn: 1 }).getTime();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState<"single" | "recurring">("single");
  const [startTime, setStartTime] = useState("");
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [time, setTime] = useState("");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [skippedNote, setSkippedNote] = useState<string | null>(null);

  const expansion = mode === "recurring" ? expandRecurring(weekdays, time, rangeStart, rangeEnd) : [];

  function toggleWeekday(value: number) {
    setWeekdays((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  async function handleAddBatch() {
    if (expansion.length === 0 || expansion.length > BATCH_CAP) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    setSkippedNote(null);
    try {
      const res = await fetch("/api/slots/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startTimes: expansion.map((d) => d.toISOString()) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "新增失敗");
      } else {
        setSuccess(`已產生 ${data.created} 筆時段`);
        if (data.skipped.length > 0) {
          const days = data.skipped
            .map((iso: string) => format(new Date(iso), "M/d"))
            .join("、");
          setSkippedNote(`${data.skipped.length} 筆因重疊跳過（${days}）`);
        }
        setShowForm(false);
        setWeekdays([]);
        setTime("");
        setRangeStart("");
        setRangeEnd("");
        router.refresh();
      }
    } catch {
      setError("網路錯誤，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddSlot() {
    if (!startTime) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    setSkippedNote(null);
    try {
      const res = await fetch("/api/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: new Date(startTime).toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "新增失敗");
      } else {
        // 面板只顯示目前檢視的週，範圍外的新增要明確告知，避免看起來像沒成功
        const slotStart = new Date(startTime);
        const inViewedWeek = slotStart >= viewStart && slotStart <= viewEnd;
        setSuccess(
          inViewedWeek
            ? "時段已新增"
            : "時段已新增（不在此週範圍，未顯示於下方列表）"
        );
        setShowForm(false);
        setStartTime("");
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
          {skippedNote && <div className="text-orange-400">{skippedNote}</div>}
        </div>
      )}

      {slots.length === 0 && !showForm && (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center text-gray-500">
          {isCurrentWeek ? "本週尚無排課" : "此週尚無排課"}
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
          <div className="flex gap-1 rounded-lg bg-gray-800 p-1 w-fit">
            {([["single", "單次"], ["recurring", "每週重複"]] as const).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setMode(value)}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  mode === value ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === "single" ? (
            <div>
              <label className="block text-xs text-gray-500 mb-1">開始時間（時段固定一小時）</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs text-gray-500 mb-1">每週重複於</label>
                <div className="flex gap-1.5">
                  {WEEKDAYS.map(({ label, value }) => (
                    <button
                      key={value}
                      onClick={() => toggleWeekday(value)}
                      className={`w-9 h-9 rounded-md border text-sm transition-colors duration-150 ${
                        weekdays.includes(value)
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "border-gray-700 text-gray-400 hover:border-gray-600"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">開始時間（固定一小時）</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">起始日期</label>
                  <input
                    type="date"
                    value={rangeStart}
                    onChange={(e) => setRangeStart(e.target.value)}
                    className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">結束日期</label>
                  <input
                    type="date"
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(e.target.value)}
                    className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <p className={`text-xs ${expansion.length > BATCH_CAP ? "text-orange-400" : "text-gray-500"}`}>
                {expansion.length > BATCH_CAP
                  ? `將產生 ${expansion.length} 筆時段，超過單次上限 ${BATCH_CAP} 筆，請縮小日期區間`
                  : expansion.length > 0
                    ? `將產生 ${expansion.length} 筆時段（${format(expansion[0], "yyyy/M/d")} ~ ${format(expansion[expansion.length - 1], "yyyy/M/d")}）`
                    : "選擇週幾、時間與日期區間後顯示預覽"}
              </p>
            </>
          )}

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setShowForm(false); setError(null); }}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              取消
            </button>
            <button
              onClick={mode === "single" ? handleAddSlot : handleAddBatch}
              disabled={
                submitting ||
                (mode === "single"
                  ? !startTime
                  : expansion.length === 0 || expansion.length > BATCH_CAP)
              }
              className="px-4 py-1.5 rounded-md text-sm bg-blue-600 hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              {submitting ? "新增中…" : mode === "single" ? "確認新增" : `產生 ${expansion.length} 筆時段`}
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
