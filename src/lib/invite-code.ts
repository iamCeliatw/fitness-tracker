// 8 碼大寫英數邀請碼（hex 字元集）；唯一性由 DB unique constraint 把關，撞碼由呼叫端重生
export function generateInviteCode() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
}
