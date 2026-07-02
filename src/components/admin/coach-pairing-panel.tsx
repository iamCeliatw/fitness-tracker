"use client";

import { useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { MemberRow, PairingRow } from "@/components/admin/members-manager";

type Props = {
  members: MemberRow[];
  pairings: PairingRow[];
  onChanged: () => Promise<void>;
};

export default function CoachPairingPanel({
  members,
  pairings,
  onChanged,
}: Props) {
  const [assignCoachId, setAssignCoachId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [endingPairing, setEndingPairing] = useState<PairingRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const coaches = useMemo(
    () => members.filter((m) => m.role === "COACH"),
    [members]
  );

  const assignableStudents = useMemo(() => {
    if (!assignCoachId) return [];
    const pairedIds = new Set(
      pairings
        .filter((p) => p.coachId === assignCoachId)
        .map((p) => p.studentId)
    );
    return members.filter(
      (m) =>
        m.role === "MEMBER" &&
        m.userId !== assignCoachId &&
        !pairedIds.has(m.userId)
    );
  }, [assignCoachId, members, pairings]);

  async function confirmAssign() {
    if (!assignCoachId || !selectedStudentId) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/coach-students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coachId: assignCoachId,
        studentId: selectedStudentId,
      }),
    });

    setSubmitting(false);
    setAssignCoachId(null);
    setSelectedStudentId("");

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "配對失敗，請稍後再試");
      return;
    }
    await onChanged();
  }

  async function confirmEnd() {
    if (!endingPairing) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/admin/coach-students/${endingPairing.id}`, {
      method: "PATCH",
    });

    setSubmitting(false);
    setEndingPairing(null);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "操作失敗，請稍後再試");
      return;
    }
    await onChanged();
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">教練配對</h2>

      {error && (
        <p className="mb-3 text-sm text-red-400 bg-red-950/40 border border-red-800 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {coaches.length === 0 ? (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center text-gray-500">
          尚無教練，先在成員列表將成員升為教練
        </div>
      ) : (
        <div className="space-y-3">
          {coaches.map((coach) => {
            const coachPairings = pairings.filter(
              (p) => p.coachId === coach.userId
            );
            return (
              <div
                key={coach.id}
                className="rounded-lg border border-gray-800 bg-gray-900 p-4 transition-colors duration-150 hover:border-gray-700"
              >
                <div className="flex items-center justify-between gap-4 mb-3">
                  <p className="text-sm font-medium text-white">
                    {coach.user?.name ?? coach.user?.email}
                    <span className="ml-2 rounded-full bg-orange-500/15 px-2 py-0.5 text-xs text-orange-400">
                      教練
                    </span>
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    onClick={() => {
                      setAssignCoachId(coach.userId);
                      setSelectedStudentId("");
                    }}
                  >
                    指派學員
                  </Button>
                </div>

                {coachPairings.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-3">
                    尚無配對學員
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {coachPairings.map((pairing) => (
                      <li
                        key={pairing.id}
                        className="flex items-center justify-between rounded-md border border-gray-800/60 bg-gray-950/60 px-3 py-2"
                      >
                        <span className="text-sm text-gray-200">
                          {pairing.student?.name ?? pairing.student?.email}
                        </span>
                        <button
                          onClick={() => setEndingPairing(pairing)}
                          className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                        >
                          結束配對
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 指派學員 Dialog */}
      <Dialog
        open={!!assignCoachId}
        onOpenChange={(open) => !open && setAssignCoachId(null)}
      >
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>指派學員</DialogTitle>
          </DialogHeader>
          {assignableStudents.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              沒有可指派的學員（皆已配對或無會員）
            </p>
          ) : (
            <div className="space-y-4">
              <Select
                value={selectedStudentId}
                onValueChange={(value) => setSelectedStudentId(value ?? "")}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="選擇學員" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800 text-white">
                  {assignableStudents.map((student) => (
                    <SelectItem key={student.userId} value={student.userId}>
                      {student.user?.name ?? student.user?.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                disabled={!selectedStudentId || submitting}
                onClick={confirmAssign}
                className="w-full bg-orange-500 hover:bg-orange-400 text-white transition-colors"
              >
                {submitting ? "建立中..." : "建立配對"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 結束配對 AlertDialog */}
      <AlertDialog
        open={!!endingPairing}
        onOpenChange={(open) => !open && setEndingPairing(null)}
      >
        <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>結束配對</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              確定要結束與 {endingPairing?.student?.name ?? endingPairing?.student?.email} 的配對嗎？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={submitting}
              onClick={confirmEnd}
              className="bg-orange-500 hover:bg-orange-400 text-white"
            >
              確定
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
