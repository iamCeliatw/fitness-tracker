"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrgSettingsForm({ bookingCutoffHours }: { bookingCutoffHours: number }) {
  const router = useRouter();
  const [hours, setHours] = useState(bookingCutoffHours);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingCutoffHours: hours }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "儲存失敗" });
      } else {
        setMessage({ type: "success", text: "設定已儲存" });
        router.refresh();
      }
    } catch {
      setMessage({ type: "error", text: "網路錯誤，請稍後再試" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
      <h2 className="text-base font-semibold mb-4">預約設定</h2>

      {message && (
        <div
          className={`mb-4 rounded-md px-4 py-2 text-sm ${
            message.type === "success"
              ? "bg-green-900/40 border border-green-700 text-green-300"
              : "bg-red-900/40 border border-red-700 text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex items-center gap-4">
        <label className="text-sm text-gray-400">距開課</label>
        <input
          type="number"
          min={1}
          value={hours}
          onChange={(e) => setHours(Number(e.target.value))}
          className="w-20 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white text-center focus:outline-none focus:border-blue-500"
        />
        <span className="text-sm text-gray-400">小時前不受理預約</span>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || hours < 1}
          className="px-4 py-2 rounded-md text-sm bg-blue-600 hover:bg-blue-500 transition-colors disabled:opacity-50"
        >
          {saving ? "儲存中…" : "儲存"}
        </button>
      </div>
    </div>
  );
}
