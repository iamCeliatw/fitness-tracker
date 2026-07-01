/**
 * Playwright Global Setup
 * Ensures test OrganizationMember records exist in Supabase so coach tests can pass.
 * Safe to run repeatedly – skips if data is already correct.
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const adminHeaders = {
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  apikey: SERVICE_ROLE_KEY,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

async function postgrestGet<T>(path: string): Promise<T[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: adminHeaders,
  });
  if (!res.ok) throw new Error(`GET ${path} failed: ${await res.text()}`);
  return res.json() as Promise<T[]>;
}

async function postgrestPost(path: string, body: unknown): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: "POST",
    headers: { ...adminHeaders, Prefer: "return=minimal" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${await res.text()}`);
}

async function postgrestPatch(path: string, body: unknown): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: "PATCH",
    headers: { ...adminHeaders, Prefer: "return=minimal" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH ${path} failed: ${await res.text()}`);
}

async function getOrCreateTestOrg(): Promise<string> {
  const orgs = await postgrestGet<{ id: string }>(
    "Organization?slug=eq.e2e-test-org&select=id",
  );
  if (orgs.length > 0) return orgs[0].id;

  const orgId = crypto.randomUUID();
  await postgrestPost("Organization", {
    id: orgId,
    name: "E2E Test Org",
    slug: "e2e-test-org",
    plan: "FREE",
    bookingCutoffHours: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  console.log(`[E2E Setup] Created test org: ${orgId}`);
  return orgId;
}

async function getUserIdByEmail(email: string): Promise<string | null> {
  const users = await postgrestGet<{ id: string }>(
    `User?email=eq.${encodeURIComponent(email)}&select=id`,
  );
  return users?.[0]?.id ?? null;
}

async function ensureOrgMember(
  orgId: string,
  userId: string,
  role: string,
): Promise<void> {
  const existing = await postgrestGet<{ id: string; role: string }>(
    `OrganizationMember?orgId=eq.${orgId}&userId=eq.${userId}&select=id,role`,
  );

  if (existing.length > 0) {
    if (existing[0].role !== role) {
      await postgrestPatch(`OrganizationMember?id=eq.${existing[0].id}`, {
        role,
      });
      console.log(
        `[E2E Setup] Updated ${email(userId)} to role ${role} in org ${orgId}`,
      );
    }
    return;
  }

  await postgrestPost("OrganizationMember", {
    id: crypto.randomUUID(),
    role,
    orgId,
    userId,
    joinedAt: new Date().toISOString(),
  });
  console.log(`[E2E Setup] Added user ${userId} as ${role} in org ${orgId}`);
}

// Helper for logging only
function email(userId: string) {
  return `user(${userId.slice(0, 8)}…)`;
}

export default async function globalSetup() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.warn(
      "[E2E Setup] Missing SUPABASE credentials – skipping test data seed.",
    );
    return;
  }

  const coachEmail = process.env.TEST_COACH_EMAIL;
  const memberEmail = process.env.TEST_USER_EMAIL;

  if (!coachEmail || !memberEmail) {
    console.warn(
      "[E2E Setup] Missing TEST_COACH_EMAIL / TEST_USER_EMAIL – skipping.",
    );
    return;
  }

  const orgId = await getOrCreateTestOrg();

  const [coachId, memberId] = await Promise.all([
    getUserIdByEmail(coachEmail),
    getUserIdByEmail(memberEmail),
  ]);

  if (!coachId) {
    console.warn(`[E2E Setup] Coach user not found: ${coachEmail}`);
  }
  if (!memberId) {
    console.warn(`[E2E Setup] Member user not found: ${memberEmail}`);
  }

  await Promise.all([
    coachId ? ensureOrgMember(orgId, coachId, "COACH") : Promise.resolve(),
    memberId ? ensureOrgMember(orgId, memberId, "MEMBER") : Promise.resolve(),
  ]);

  console.log(`[E2E Setup] Done. org=${orgId}`);
}
