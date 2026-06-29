"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type ExerciseItem = {
  id: string;
  name: string;
  muscleGroup: string;
  category: string;
};

const MUSCLE_LABELS: Record<string, string> = {
  ALL: "全部",
  CHEST: "胸",
  BACK: "背",
  SHOULDERS: "肩",
  ARMS: "手臂",
  LEGS: "腿",
  GLUTES: "臀",
  CORE: "核心",
  CARDIO: "有氧",
};

const SELECTABLE_MUSCLE_GROUPS = ["CHEST", "BACK", "SHOULDERS", "ARMS", "LEGS", "GLUTES", "CORE", "CARDIO"];

interface WorkoutExercisePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (exercise: ExerciseItem) => void;
  selectedIds: string[];
}

export default function WorkoutExercisePicker({
  open,
  onOpenChange,
  onSelect,
  selectedIds,
}: WorkoutExercisePickerProps) {
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("ALL");

  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customMuscle, setCustomMuscle] = useState("");
  const [creating, setCreating] = useState(false);

  function fetchExercises() {
    setLoading(true);
    fetch("/api/exercises")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setExercises(data);
        else console.error("[ExercisePicker] unexpected response:", data);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchExercises();
  }, [open]);

  const filtered = exercises.filter((ex) => {
    const matchMuscle = muscleFilter === "ALL" || ex.muscleGroup === muscleFilter;
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    return matchMuscle && matchSearch;
  });

  const muscleGroups = ["ALL", ...Array.from(new Set(exercises.map((e) => e.muscleGroup)))];

  async function handleCreateCustom() {
    if (!customName.trim() || !customMuscle) return;
    setCreating(true);
    try {
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: customName.trim(), muscleGroup: customMuscle }),
      });
      if (!res.ok) return;
      const newExercise: ExerciseItem = await res.json();
      setShowCustomForm(false);
      setCustomName("");
      setCustomMuscle("");
      fetchExercises();
      onSelect(newExercise);
      onOpenChange(false);
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md flex flex-col h-[540px] max-h-[90vh]">
        <DialogHeader className="shrink-0">
          <DialogTitle>選擇動作</DialogTitle>
        </DialogHeader>

        <div className="relative shrink-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="搜尋動作..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>

        <Tabs value={muscleFilter} onValueChange={setMuscleFilter} className="shrink-0">
          <TabsList className="bg-gray-800 flex flex-wrap h-auto gap-1 p-1">
            {muscleGroups.map((mg) => (
              <TabsTrigger
                key={mg}
                value={mg}
                className="text-xs data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              >
                {MUSCLE_LABELS[mg] ?? mg}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {loading && (
            <p className="text-gray-500 text-sm text-center py-8">載入中...</p>
          )}
          {!loading && filtered.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-8">
              {exercises.length === 0 ? "動作庫尚無資料，請聯絡管理員" : "找不到符合的動作"}
            </p>
          )}
          {filtered.map((ex) => {
            const isSelected = selectedIds.includes(ex.id);
            return (
              <Button
                key={ex.id}
                variant="ghost"
                disabled={isSelected}
                onClick={() => {
                  onSelect(ex);
                  onOpenChange(false);
                }}
                className="w-full justify-between h-auto py-2 px-3 text-left hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-sm text-white">{ex.name}</span>
                <div className="flex items-center gap-1.5">
                  {isSelected && (
                    <span className="text-xs text-gray-500">已加入</span>
                  )}
                  <Badge
                    variant="outline"
                    className="text-xs border-gray-600 text-gray-400"
                  >
                    {MUSCLE_LABELS[ex.muscleGroup] ?? ex.muscleGroup}
                  </Badge>
                </div>
              </Button>
            );
          })}
        </div>

        {/* Custom exercise footer */}
        <div className="shrink-0 border-t border-gray-800 pt-3">
          {!showCustomForm ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowCustomForm(true)}
              className="text-gray-400 hover:text-white hover:bg-gray-800 h-8 px-2 text-xs w-full justify-start"
            >
              <Plus className="h-3 w-3 mr-1" />
              新增自訂動作
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="動作名稱"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 h-8 text-sm"
                />
                <Select value={customMuscle} onValueChange={(v) => setCustomMuscle(v ?? "")}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-8 text-sm w-28 shrink-0">
                    <SelectValue placeholder="肌群" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    {SELECTABLE_MUSCLE_GROUPS.map((mg) => (
                      <SelectItem key={mg} value={mg} className="text-sm">
                        {MUSCLE_LABELS[mg]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={!customName.trim() || !customMuscle || creating}
                  onClick={handleCreateCustom}
                  className="bg-orange-500 hover:bg-orange-600 text-white h-8 text-xs flex-1"
                >
                  {creating ? "建立中..." : "建立並加入"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => { setShowCustomForm(false); setCustomName(""); setCustomMuscle(""); }}
                  className="text-gray-400 hover:text-white h-8 text-xs"
                >
                  取消
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
