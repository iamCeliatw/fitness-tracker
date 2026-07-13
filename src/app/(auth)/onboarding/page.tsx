import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-helpers";
import { createAdminClient } from "@/lib/supabase/server";
import OnboardingForm from "@/components/auth/onboarding-form";

// 已登入但無 membership 的用戶補完二選一；未登入由 proxy 導 /login
export default async function OnboardingPage() {
  const user = await requireAuth();

  const admin = await createAdminClient();
  const { data: membership } = await admin
    .from("OrganizationMember")
    .select("id")
    .eq("userId", user.id)
    .maybeSingle();

  if (membership) redirect("/dashboard");

  return <OnboardingForm />;
}
