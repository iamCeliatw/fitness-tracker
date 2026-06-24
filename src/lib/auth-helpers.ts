import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Role } from "@/generated/prisma/enums";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireRole(role: Role) {
  const session = await requireAuth();
  if (session.user.role !== role) redirect("/dashboard");
  return session;
}
