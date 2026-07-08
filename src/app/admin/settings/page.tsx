import { requireOrgRole } from "@/lib/auth-helpers";
import { createAdminClient } from "@/lib/supabase/server";
import OrgSettingsForm from "@/components/admin/org-settings-form";
import InviteCodeCard from "@/components/admin/invite-code-card";

export default async function AdminSettingsPage() {
  const { orgId } = await requireOrgRole("OWNER");
  const admin = await createAdminClient();

  const { data: org } = await admin
    .from("Organization")
    .select("id, name, bookingCutoffHours, approvalTimeoutHours, inviteCode")
    .eq("id", orgId)
    .single();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">系統設定</h1>
      <p className="text-gray-400 mb-6">{org?.name ?? "組織設定"}</p>
      <div className="space-y-6">
        <OrgSettingsForm
          bookingCutoffHours={org?.bookingCutoffHours ?? 2}
          approvalTimeoutHours={org?.approvalTimeoutHours ?? 24}
        />
        <InviteCodeCard inviteCode={org?.inviteCode ?? ""} />
      </div>
    </div>
  );
}
