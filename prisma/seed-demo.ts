/**
 * Demo account seed — 建立對外展示用的 demo 帳號與示範資料。
 * 冪等：demo org 已存在時直接跳過。
 *
 * 帳號（密碼皆為 demo1234，公開於 README）：
 *   demo-member@example.com  學員（有訓練/飲食/體重記錄、預約）
 *   demo-coach@example.com   教練（有時段、待審核預約）
 *   demo-admin@example.com   管理員（後台）
 *
 * 執行：npx tsx prisma/seed-demo.ts
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const headers = {
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  apikey: SERVICE_ROLE_KEY,
  "Content-Type": "application/json",
};

const DEMO_PASSWORD = "demo1234";
const ORG_SLUG = "liftlog-demo";

async function get<T>(path: string): Promise<T[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers });
  if (!res.ok) throw new Error(`GET ${path}: ${await res.text()}`);
  return res.json() as Promise<T[]>;
}

async function post(path: string, body: unknown): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path}: ${await res.text()}`);
}

/** 建 Supabase Auth 使用者，已存在則回傳既有 id */
async function createAuthUser(email: string, name: string): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { name },
    }),
  });
  if (res.ok) {
    const user = (await res.json()) as { id: string };
    return user.id;
  }
  // 已存在（422）→ 從 public.User 撈 id
  const existing = await get<{ id: string }>(
    `User?email=eq.${encodeURIComponent(email)}&select=id`,
  );
  if (existing.length > 0) return existing[0].id;
  throw new Error(`Create auth user ${email} failed: ${await res.text()}`);
}

function daysFromNow(days: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const now = () => new Date().toISOString();
const uuid = () => crypto.randomUUID();

async function main() {
  const orgs = await get<{ id: string }>(`Organization?slug=eq.${ORG_SLUG}&select=id`);
  if (orgs.length > 0) {
    console.log(`Demo org already exists (${orgs[0].id}) — skipping seed.`);
    return;
  }

  // ── Auth users + public.User ──
  const [memberId, coachId, adminId] = await Promise.all([
    createAuthUser("demo-member@example.com", "Demo 學員"),
    createAuthUser("demo-coach@example.com", "Demo 教練"),
    createAuthUser("demo-admin@example.com", "Demo 管理員"),
  ]);

  for (const [id, email, name, role] of [
    [memberId, "demo-member@example.com", "Demo 學員", "USER"],
    [coachId, "demo-coach@example.com", "Demo 教練", "USER"],
    [adminId, "demo-admin@example.com", "Demo 管理員", "ADMIN"],
  ] as const) {
    // setup.sql 的 on_auth_user_created trigger 會自動建 User row（role=USER），
    // 所以這裡一律 upsert：不存在就建、存在就補 name/role
    const rows = await get<{ id: string; role: string }>(`User?id=eq.${id}&select=id,role`);
    if (rows.length === 0) {
      await post("User", { id, email, name, role, createdAt: now(), updatedAt: now() });
    } else if (rows[0].role !== role) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/User?id=eq.${id}`, {
        method: "PATCH",
        headers: { ...headers, Prefer: "return=minimal" },
        body: JSON.stringify({ name, role }),
      });
      if (!res.ok) throw new Error(`PATCH User ${email}: ${await res.text()}`);
    }
  }
  console.log(`Users ready: member=${memberId} coach=${coachId} admin=${adminId}`);

  // ── Org + membership + 配對 ──
  const orgId = uuid();
  await post("Organization", {
    id: orgId, name: "LIFTLOG Demo Gym", slug: ORG_SLUG, plan: "FREE",
    bookingCutoffHours: 2, approvalTimeoutHours: 24,
    createdAt: now(), updatedAt: now(),
  });
  await post("OrganizationMember", [
    { id: uuid(), role: "ADMIN", orgId, userId: adminId, joinedAt: now() },
    { id: uuid(), role: "COACH", orgId, userId: coachId, joinedAt: now() },
    { id: uuid(), role: "MEMBER", orgId, userId: memberId, joinedAt: now() },
  ]);
  await post("CoachStudent", {
    id: uuid(), status: "ACTIVE", coachId, studentId: memberId, orgId, assignedAt: now(),
  });
  console.log(`Org + pairing ready: ${orgId}`);

  // ── 教練時段：未來 5 天、每天 10:00 與 19:00 ──
  type Slot = { id: string; startTime: string; endTime: string; status: string };
  const slots: Slot[] = [];
  for (let d = 1; d <= 5; d++) {
    for (const h of [10, 19]) {
      slots.push({
        id: uuid(),
        startTime: daysFromNow(d, h),
        endTime: daysFromNow(d, h + 1),
        status: "OPEN",
      });
    }
  }
  // 明天 10:00 → 已確認；後天 19:00 → 待審核
  slots[0].status = "BOOKED";
  slots[3].status = "BOOKED";
  await post("AppointmentSlot", slots.map((s) => ({ ...s, coachId, orgId, createdAt: now() })));
  await post("Appointment", [
    {
      id: uuid(), status: "CONFIRMED", notes: "想加強深蹲姿勢", expiresAt: null,
      slotId: slots[0].id, studentId: memberId, coachId, orgId, createdAt: now(),
    },
    {
      id: uuid(), status: "PENDING", notes: "第一次上課，請多指教",
      expiresAt: daysFromNow(1, 0),
      slotId: slots[3].id, studentId: memberId, coachId, orgId, createdAt: now(),
    },
  ]);
  console.log(`Slots + appointments ready (${slots.length} slots, 1 confirmed, 1 pending)`);

  // ── 學員訓練記錄：過去兩週 5 次 ──
  const exercises = await get<{ id: string; name: string }>(
    "Exercise?isCustom=eq.false&select=id,name",
  );
  const ex = (name: string) => exercises.find((e) => e.name === name)?.id;
  const sessions: Array<{ daysAgo: number; items: Array<[string, number[]]> }> = [
    { daysAgo: 13, items: [["槓鈴臥推", [60, 60, 65]], ["滑輪下拉", [50, 55, 55]]] },
    { daysAgo: 10, items: [["深蹲", [80, 85, 85]], ["腿推", [120, 130, 130]]] },
    { daysAgo: 7, items: [["肩推", [30, 32.5, 32.5]], ["側平舉", [8, 8, 10]]] },
    { daysAgo: 4, items: [["槓鈴臥推", [65, 65, 70]], ["啞鈴飛鳥", [12, 14, 14]]] },
    { daysAgo: 1, items: [["硬舉", [100, 105, 110]], ["槓鈴划船", [55, 60, 60]]] },
  ];
  for (const s of sessions) {
    const logId = uuid();
    const date = new Date();
    date.setDate(date.getDate() - s.daysAgo);
    date.setHours(18, 30, 0, 0);
    await post("WorkoutLog", {
      id: logId, date: date.toISOString(), duration: 60,
      userId: memberId, createdAt: now(), updatedAt: now(),
    });
    for (const [i, [name, weights]] of s.items.entries()) {
      const exerciseId = ex(name);
      if (!exerciseId) continue;
      const logExId = uuid();
      await post("WorkoutLogExercise", { id: logExId, order: i, logId, exerciseId });
      await post("WorkoutSet", weights.map((w, j) => ({
        id: uuid(), setNumber: j + 1, reps: 8, weight: w, completed: true, exerciseId: logExId,
      })));
    }
  }
  console.log(`Workout logs ready (${sessions.length} sessions)`);

  // ── 飲食記錄：今天 + 昨天 ──
  const meals: Array<[number, string, string, number, number]> = [
    [0, "BREAKFAST", "燕麥 + 希臘優格", 380, 25],
    [0, "LUNCH", "雞胸肉便當", 650, 45],
    [0, "SNACK", "乳清蛋白", 120, 24],
    [1, "BREAKFAST", "蛋餅 + 豆漿", 450, 22],
    [1, "LUNCH", "鮭魚定食", 700, 40],
    [1, "DINNER", "牛肉麵", 750, 35],
  ];
  await post("FoodEntry", meals.map(([daysAgo, mealType, name, calories, protein]) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(12, 0, 0, 0);
    return {
      id: uuid(), date: d.toISOString(), mealType, name, calories, protein,
      userId: memberId, createdAt: now(),
    };
  }));
  console.log("Food entries ready");

  // ── 體重趨勢:每週一筆、8 週緩降 ──
  await post("BodyRecord", Array.from({ length: 8 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (7 - i) * 7);
    d.setHours(8, 0, 0, 0);
    return {
      id: uuid(), date: d.toISOString(),
      weight: Math.round((74 - i * 0.4) * 10) / 10,
      bodyFat: Math.round((22 - i * 0.25) * 10) / 10,
      userId: memberId, createdAt: now(),
    };
  }));
  console.log("Body records ready");

  console.log("\nDemo seed 完成 ✓");
  console.log("  demo-member@example.com / demo1234");
  console.log("  demo-coach@example.com  / demo1234");
  console.log("  demo-admin@example.com  / demo1234");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
