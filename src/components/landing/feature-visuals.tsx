/**
 * 功能卡片內的迷你產品 UI 示意（純 JSX，延續 hero mock 風格）。
 * 每個 visual 對應 features-data.ts 的一筆功能。
 */
import { Check } from "lucide-react";

const panel =
  "rounded-lg border border-gray-800 bg-gray-950/60 p-3 text-left";

export function WorkoutLogVisual() {
  const sets = [
    { name: "槓鈴臥推", detail: "60 kg × 8", done: true },
    { name: "啞鈴划船", detail: "24 kg × 12", done: true },
    { name: "肩上推舉", detail: "32 kg × 10", done: false },
  ];
  return (
    <div className={panel}>
      <ul className="space-y-1.5">
        {sets.map((set) => (
          <li
            key={set.name}
            className="flex items-center justify-between rounded-md border border-gray-800/60 bg-gray-900/60 px-3 py-1.5"
          >
            <span className="text-xs font-medium text-gray-200">
              {set.name}
            </span>
            <span className="flex items-center gap-2 text-[11px] text-gray-500">
              {set.detail}
              {set.done && <Check className="h-3 w-3 text-orange-500" />}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BodyTrendVisual() {
  return (
    <div className={panel}>
      <div className="flex items-baseline justify-between">
        <span className="text-lg font-bold text-white">72.4 kg</span>
        <span className="text-[11px] text-orange-400">▾ 0.6 kg／30 天</span>
      </div>
      <svg viewBox="0 0 220 56" className="mt-2 h-14 w-full" aria-hidden>
        <path
          d="M0,22 C22,20 33,30 55,28 C77,26 88,16 110,20 C132,24 143,36 165,34 C187,32 198,40 220,38"
          fill="none"
          stroke="#f97316"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M0,34 C22,33 33,38 55,37 C77,36 88,30 110,32 C132,34 143,42 165,41 C187,40 198,45 220,44"
          fill="none"
          stroke="#6b7280"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          strokeLinecap="round"
        />
      </svg>
      <div className="mt-1 flex gap-3 text-[10px] text-gray-500">
        <span className="text-orange-400">— 體重</span>
        <span>--- 體脂率</span>
      </div>
    </div>
  );
}

export function BookingVisual() {
  const slots = [
    { time: "週三 19:00", coach: "阿傑教練", booked: false },
    { time: "週五 20:00", coach: "阿傑教練", booked: true },
  ];
  return (
    <div className={panel}>
      <ul className="space-y-1.5">
        {slots.map((slot) => (
          <li
            key={slot.time}
            className="flex items-center justify-between rounded-md border border-gray-800/60 bg-gray-900/60 px-3 py-1.5"
          >
            <span className="text-xs text-gray-200">
              {slot.time}
              <span className="ml-2 text-[10px] text-gray-500">
                {slot.coach}
              </span>
            </span>
            {slot.booked ? (
              <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-medium text-orange-400">
                已預約
              </span>
            ) : (
              <span className="rounded-full border border-gray-700 px-2 py-0.5 text-[10px] text-gray-400">
                可預約
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AuditLogVisual() {
  const logs = [
    { action: "UPDATE", target: "org.settings", who: "admin@liftlog", at: "10:32" },
    { action: "CANCEL", target: "appointment", who: "coach.jay", at: "09:17" },
  ];
  return (
    <div className={panel}>
      <ul className="space-y-1.5 font-mono">
        {logs.map((log) => (
          <li
            key={log.at}
            className="flex items-center gap-2 rounded-md border border-gray-800/60 bg-gray-900/60 px-3 py-1.5 text-[10px]"
          >
            <span className="rounded bg-orange-500/15 px-1.5 py-0.5 font-semibold text-orange-400">
              {log.action}
            </span>
            <span className="text-gray-300">{log.target}</span>
            <span className="ml-auto text-gray-500">
              {log.who} · {log.at}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
