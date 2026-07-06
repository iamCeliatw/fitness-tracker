import { createAdminClient } from "@/lib/supabase/server";

/**
 * 惰性結算過期的 PENDING 預約（無 cron，讀取前呼叫）。
 * 順序：先轉 EXPIRED 再釋放 slot——失敗時偏保守（slot 晚一次讀取才釋出），
 * 不會出現時段被搶但預約還活著。
 */
export async function expireStalePending(orgId: string) {
  const admin = await createAdminClient();
  const now = new Date().toISOString();

  const { data: stale } = await admin
    .from("Appointment")
    .select("id, slotId")
    .eq("orgId", orgId)
    .eq("status", "PENDING")
    .lt("expiresAt", now);

  if (!stale || stale.length === 0) return;

  const { error } = await admin
    .from("Appointment")
    .update({ status: "EXPIRED" })
    .in("id", stale.map((a) => a.id));
  if (error) return; // 結算失敗不擋讀取，下次再補

  await admin
    .from("AppointmentSlot")
    .update({ status: "OPEN" })
    .in("id", stale.map((a) => a.slotId));
}
