"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ChevronDown } from "lucide-react";

type AuditLog = {
  id: string;
  tableName: string;
  recordId: string;
  operation: string;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  actorId: string | null;
  createdAt: string;
};

const OP_COLORS: Record<string, string> = {
  INSERT: "text-green-400",
  UPDATE: "text-yellow-400",
  DELETE: "text-red-400",
};

function JsonDiff({ label, data }: { label: string; data: Record<string, unknown> | null }) {
  if (!data) return <div className="text-gray-600 text-xs">{label}：（無）</div>;
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <pre className="text-xs bg-gray-950 rounded p-2 overflow-x-auto text-gray-300 max-h-40">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

export default function AuditLogTable({
  logs,
  page,
  totalPages,
  total,
  tableFilter,
  allowedTables,
}: {
  logs: AuditLog[];
  page: number;
  totalPages: number;
  total: number;
  tableFilter: string | null;
  allowedTables: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [expanded, setExpanded] = useState<string | null>(null);

  function navigate(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null) params.delete(k);
      else params.set(k, v);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm text-gray-400">篩選：</span>
        <button
          onClick={() => navigate({ table: null, page: "1" })}
          className={`px-3 py-1 rounded-md text-sm transition-colors ${!tableFilter ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"}`}
        >
          全部
        </button>
        {allowedTables.map((t) => (
          <button
            key={t}
            onClick={() => navigate({ table: t, page: "1" })}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${tableFilter === t ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"}`}
          >
            {t}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-600">共 {total} 筆</span>
      </div>

      {/* Log list */}
      {logs.length === 0 ? (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center text-gray-500">
          目前沒有稽核紀錄
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const isOpen = expanded === log.id;
            return (
              <div
                key={log.id}
                className="rounded-lg border border-gray-800 bg-gray-900 overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : log.id)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-800/50 transition-colors"
                >
                  <span className="text-xs text-gray-500 shrink-0 w-36">
                    {format(new Date(log.createdAt), "MM-dd HH:mm:ss")}
                  </span>
                  <span className="text-sm text-gray-400 shrink-0 w-36">{log.tableName}</span>
                  <span className={`text-xs font-mono font-medium shrink-0 w-16 ${OP_COLORS[log.operation] ?? "text-gray-400"}`}>
                    {log.operation}
                  </span>
                  <span className="text-xs text-gray-600 truncate flex-1 font-mono">{log.recordId}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Expandable detail */}
                <div className={`grid transition-all duration-200 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-gray-800 pt-3">
                      <JsonDiff label="Before" data={log.oldData} />
                      <JsonDiff label="After" data={log.newData} />
                      {log.actorId && (
                        <div className="sm:col-span-2 text-xs text-gray-500">
                          執行者：<span className="font-mono text-gray-400">{log.actorId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6 text-sm">
          <button
            onClick={() => navigate({ page: String(page - 1) })}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-md border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            上一頁
          </button>
          <span className="text-gray-500">第 {page} / {totalPages} 頁</span>
          <button
            onClick={() => navigate({ page: String(page + 1) })}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-md border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            下一頁
          </button>
        </div>
      )}
    </div>
  );
}
