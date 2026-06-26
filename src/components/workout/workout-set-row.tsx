"use client";

import { Copy, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface WorkoutSetRowProps {
  setNumber: number;
  repsProps: React.InputHTMLAttributes<HTMLInputElement> & { name: string };
  weightProps: React.InputHTMLAttributes<HTMLInputElement> & { name: string };
  onRemove: () => void;
  canRemove: boolean;
  onCopy?: () => void;
}

export default function WorkoutSetRow({
  setNumber,
  repsProps,
  weightProps,
  onRemove,
  canRemove,
  onCopy,
}: WorkoutSetRowProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-500 text-xs w-6 text-center shrink-0">{setNumber}</span>
      <Input
        type="number"
        min="1"
        step="1"
        placeholder="次數"
        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-600 h-8 text-sm"
        {...repsProps}
      />
      <Input
        type="number"
        min="0"
        step="0.5"
        placeholder="kg"
        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-600 h-8 text-sm"
        {...weightProps}
      />
      {onCopy && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onCopy}
          className="h-8 w-8 shrink-0 text-gray-600 hover:text-blue-400 hover:bg-blue-950/30"
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={!canRemove}
        onClick={onRemove}
        className="h-8 w-8 shrink-0 text-gray-600 hover:text-red-400 hover:bg-red-950/30 disabled:opacity-20"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
