"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Trash2 } from "lucide-react";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type BodyRecord = {
  id: string;
  date: string;
  weight: number | null;
  bodyFat: number | null;
  muscleMass: number | null;
};

interface BodyRecordListProps {
  records: BodyRecord[];
}

export default function BodyRecordList({ records }: BodyRecordListProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!pendingId) return;
    setIsDeleting(true);
    await fetch(`/api/body-records/${pendingId}`, { method: "DELETE" });
    setIsDeleting(false);
    setPendingId(null);
    router.refresh();
  }

  return (
    <>
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-base">歷史記錄</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {records.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-10 px-6">
              還沒有記錄，新增第一筆吧！
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-transparent">
                  <TableHead className="text-gray-400">日期</TableHead>
                  <TableHead className="text-gray-400">體重</TableHead>
                  <TableHead className="text-gray-400">體脂率</TableHead>
                  <TableHead className="text-gray-400">肌肉量</TableHead>
                  <TableHead className="text-gray-400 w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.id} className="border-gray-800 hover:bg-gray-800/50">
                    <TableCell className="text-gray-300 text-sm">
                      {format(parseISO(r.date), "yyyy/MM/dd")}
                    </TableCell>
                    <TableCell className="text-white font-medium">
                      {r.weight != null ? `${r.weight} kg` : "—"}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {r.bodyFat != null ? `${r.bodyFat}%` : "—"}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {r.muscleMass != null ? `${r.muscleMass} kg` : "—"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-600 hover:text-red-400 hover:bg-red-950/30"
                        onClick={() => setPendingId(r.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!pendingId} onOpenChange={(open) => !open && setPendingId(null)}>
        <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              此操作無法復原，確定要刪除這筆量測記錄嗎？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "刪除中..." : "確認刪除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
