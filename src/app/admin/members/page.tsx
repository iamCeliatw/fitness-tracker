import { requireOrgRole } from "@/lib/auth-helpers";
import { createAdminClient } from "@/lib/supabase/server";
import MembersManager, {
  type MemberRow,
  type PairingRow,
} from "@/components/admin/members-manager";

export default async function AdminMembersPage() {
  const { orgId } = await requireOrgRole("ADMIN");
  const admin = await createAdminClient();

  const [{ data: members }, { data: pairings }] = await Promise.all([
    admin
      .from("OrganizationMember")
      .select("id, role, joinedAt, userId, user:User(id, name, email)")
      .eq("orgId", orgId)
      .order("joinedAt", { ascending: true }),
    admin
      .from("CoachStudent")
      .select(
        "id, status, coachId, studentId, student:User!CoachStudent_studentId_fkey(id, name, email)"
      )
      .eq("orgId", orgId)
      .eq("status", "ACTIVE"),
  ]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">成員管理</h1>
      <p className="text-gray-400 mb-6">組織成員的角色與教練配對</p>
      <MembersManager
        initialMembers={(members ?? []) as unknown as MemberRow[]}
        initialPairings={(pairings ?? []) as unknown as PairingRow[]}
      />
    </div>
  );
}
