"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import type { MemberRow } from "@/components/admin/members-manager";

const roleBadge: Record<string, { label: string; className: string }> = {
  OWNER: { label: "擁有者", className: "bg-orange-500/15 text-orange-400" },
  ADMIN: { label: "組織管理", className: "bg-orange-500/15 text-orange-400" },
  COACH: { label: "教練", className: "bg-orange-500/15 text-orange-400" },
  MEMBER: { label: "會員", className: "border border-gray-700 text-gray-400" },
};

type Props = {
  members: MemberRow[];
  onChanged: () => Promise<void>;
};

export default function MemberList({ members, onChanged }: Props) {
  const [pending, setPending] = useState<MemberRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function confirmRoleChange() {
    if (!pending) return;
    setSubmitting(true);
    setError(null);

    const nextRole = pending.role === "COACH" ? "MEMBER" : "COACH";
    const res = await fetch(`/api/admin/members/${pending.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole }),
    });

    setSubmitting(false);
    setPending(null);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "操作失敗，請稍後再試");
      return;
    }
    await onChanged();
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">成員列表</h2>

      {error && (
        <p className="mb-3 text-sm text-red-400 bg-red-950/40 border border-red-800 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {members.length === 0 ? (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center text-gray-500">
          尚無成員
        </div>
      ) : (
        <ul className="space-y-2">
          {members.map((member) => {
            const badge = roleBadge[member.role] ?? roleBadge.MEMBER;
            const switchable =
              member.role === "COACH" || member.role === "MEMBER";
            return (
              <li
                key={member.id}
                className="rounded-lg border border-gray-800 bg-gray-900 p-4 flex items-center justify-between gap-4 transition-colors duration-150 hover:border-gray-700"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {member.user?.name ?? "（未命名）"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {member.user?.email}・
                    {new Date(member.joinedAt).toLocaleDateString("zh-TW")} 加入
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                  {switchable && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                      onClick={() => setPending(member)}
                    >
                      {member.role === "COACH" ? "降為會員" : "升為教練"}
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <AlertDialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.role === "COACH" ? "降為會員" : "升為教練"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              確定要將 {pending?.user?.name ?? pending?.user?.email}
              {pending?.role === "COACH"
                ? " 降為會員嗎？降級前需結束其所有配對與未來時段。"
                : " 升為教練嗎？升級後可管理時段與學員。"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={submitting}
              onClick={confirmRoleChange}
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
