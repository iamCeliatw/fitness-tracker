"use client";

import { useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function InviteCodeCard({ inviteCode }: { inviteCode: string }) {
  const [code, setCode] = useState(inviteCode);
  const [copied, setCopied] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1500);
  }

  async function handleReset() {
    setResetting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings/invite-code", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "重置失敗");
      } else {
        setCode(data.inviteCode);
      }
    } catch {
      setError("網路錯誤，請稍後再試");
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-6 transition-colors duration-150 hover:border-gray-700">
      <h2 className="text-base font-semibold mb-1">邀請碼</h2>
      <p className="text-sm text-gray-400 mb-4">
        分享給學員，註冊時輸入即可加入你的健身房
      </p>

      {error && (
        <div className="mb-4 rounded-md px-4 py-2 text-sm bg-red-900/40 border border-red-700 text-red-300">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="font-mono text-lg tracking-widest bg-gray-800 border border-gray-700 rounded-md px-4 py-2">
          {code}
        </span>
        <button
          onClick={handleCopy}
          className="px-4 py-2 rounded-md text-sm bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors"
        >
          {copied ? "已複製" : "複製"}
        </button>

        <AlertDialog>
          <AlertDialogTrigger
            disabled={resetting}
            className="ml-auto px-4 py-2 rounded-md text-sm text-red-400 border border-red-900/60 hover:bg-red-950/40 transition-colors disabled:opacity-50"
          >
            {resetting ? "重置中…" : "重置邀請碼"}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>重置邀請碼？</AlertDialogTitle>
              <AlertDialogDescription>
                舊邀請碼將立即失效，已分享出去的碼將無法再用於註冊。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset}>
                確認重置
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
