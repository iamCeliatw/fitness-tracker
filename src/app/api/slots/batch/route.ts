import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { setAuditActor } from "@/lib/auth-helpers";
import { SLOT_DURATION_MS } from "@/lib/appointments";

// 展開（週幾+時間+區間 → 具體時間清單）由 client 完成，server 只收結果，
// 不需處理使用者時區換算；上限 84 = 12 週 × 7 天
const batchSchema = z.object({
  startTimes: z
    .array(z.string().datetime("無效的時間格式"))
    .min(1, "至少需要一筆時段")
    .max(84, "一次最多產生 84 筆時段（約 12 週）"),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await createAdminClient();
  const { data: membership } = await admin
    .from("OrganizationMember")
    .select("orgId, role")
    .eq("userId", user.id)
    .single();

  if (!membership || membership.role !== "COACH") {
    return NextResponse.json({ error: "Forbidden: coach role required" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "無效的請求格式" }, { status: 400 });

  const parsed = batchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const now = Date.now();
  const candidates = parsed.data.startTimes
    .map((t) => Date.parse(t))
    .sort((a, b) => a - b)
    .map((start) => ({ start, end: start + SLOT_DURATION_MS }));

  if (candidates[0].start <= now) {
    return NextResponse.json({ error: "時段必須在未來" }, { status: 400 });
  }

  // 單次查詢撈出範圍內現有時段，記憶體比對 overlap（時段固定一小時，批次量 ≤84）
  const rangeStart = new Date(candidates[0].start).toISOString();
  const rangeEnd = new Date(candidates[candidates.length - 1].end).toISOString();
  const { data: existing } = await admin
    .from("AppointmentSlot")
    .select("startTime, endTime")
    .eq("coachId", user.id)
    .in("status", ["OPEN", "BOOKED"])
    .lt("startTime", rangeEnd)
    .gt("endTime", rangeStart);

  const existingRanges = (existing ?? []).map((s) => ({
    start: Date.parse(s.startTime),
    end: Date.parse(s.endTime),
  }));

  const overlaps = (r: { start: number; end: number }, c: { start: number; end: number }) =>
    r.start < c.end && r.end > c.start;

  const skipped: string[] = [];
  const accepted: { start: number; end: number }[] = [];
  for (const c of candidates) {
    // accepted 也要比對：批次內部互相重疊（含重複值）視為衝突跳過
    if (existingRanges.some((r) => overlaps(r, c)) || accepted.some((r) => overlaps(r, c))) {
      skipped.push(new Date(c.start).toISOString());
    } else {
      accepted.push(c);
    }
  }

  if (accepted.length > 0) {
    await setAuditActor(user.id);
    const createdAt = new Date().toISOString();
    const { error } = await admin.from("AppointmentSlot").insert(
      accepted.map((c) => ({
        id: crypto.randomUUID(),
        coachId: user.id,
        orgId: membership.orgId,
        startTime: new Date(c.start).toISOString(),
        endTime: new Date(c.end).toISOString(),
        status: "OPEN",
        createdAt,
      })),
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { created: accepted.length, skipped },
    { status: accepted.length > 0 ? 201 : 200 },
  );
}
