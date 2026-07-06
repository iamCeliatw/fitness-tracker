"use client";

import { useState } from "react";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { Clock, User, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type PendingAppointment = {
  id: string;
  notes: string | null;
  student: { id: string; name: string | null } | null;
  slot: { id: string; startTime: string; endTime: string } | null;
};

export default function PendingAppointments({
  appointments,
}: {
  appointments: PendingAppointment[];
}) {
  const router = useRouter();
  const [acting, setActing] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<PendingAppointment | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function respond(id: string, action: "confirm" | "reject", reason?: string) {
    setActing(id);
    setError(null);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "操作失敗");
        return;
      }
      setRejecting(null);
      setReason("");
      router.refresh();
    } finally {
      setActing(null);
    }
  }

  if (appointments.length === 0) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center text-gray-500">
        目前沒有待確認的預約
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded bg-red-900/40 border border-red-700 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {appointments.map((apt) => (
        <div
          key={apt.id}
          className="rounded-lg border border-orange-400/30 bg-gray-900 p-4 flex items-center justify-between gap-4 transition-colors duration-150 hover:border-orange-400/60"
        >
          <div className="flex flex-col gap-1 min-w-0">
            {apt.slot && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Clock className="w-4 h-4 shrink-0" />
                <span>
                  {format(new Date(apt.slot.startTime), "M月d日 (EEE) HH:mm", { locale: zhTW })}–
                  {format(new Date(apt.slot.endTime), "HH:mm")}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <User className="w-3.5 h-3.5 shrink-0" />
              <span>{apt.student?.name ?? "學員"}</span>
            </div>
            {apt.notes && <p className="text-sm text-gray-500">備註：{apt.notes}</p>}
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => respond(apt.id, "confirm")}
              disabled={acting === apt.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm bg-orange-500 hover:bg-orange-600 text-white transition-colors disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              確認
            </button>
            <button
              onClick={() => { setRejecting(apt); setReason(""); }}
              disabled={acting === apt.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-gray-400 border border-gray-700 hover:border-red-700 hover:text-red-400 transition-colors disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
              拒絕
            </button>
          </div>
        </div>
      ))}

      <Dialog open={rejecting !== null} onOpenChange={(open) => !open && setRejecting(null)}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>拒絕預約</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">原因（選填）</Label>
              <Textarea
                id="reject-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="例：當天有私人行程"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setRejecting(null)}
                className="text-gray-300 hover:bg-gray-800 transition-colors"
              >
                取消
              </Button>
              <Button
                onClick={() => rejecting && respond(rejecting.id, "reject", reason.trim() || undefined)}
                disabled={acting !== null}
                className="bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                {acting ? "送出中…" : "確認拒絕"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
