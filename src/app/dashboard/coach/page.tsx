import { requireOrgRole } from "@/lib/auth-helpers";
import { createAdminClient } from "@/lib/supabase/server";
import { expireStalePending } from "@/lib/appointments";
import StudentProgressList from "@/components/coach/student-progress-list";
import WeeklySchedule from "@/components/coach/weekly-schedule";
import PendingAppointments from "@/components/coach/pending-appointments";
import { startOfWeek, endOfWeek, subDays, addWeeks, format } from "date-fns";
import Link from "next/link";

export default async function CoachDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { userId, orgId } = await requireOrgRole("COACH");
  const admin = await createAdminClient();
  await expireStalePending(orgId);

  const { week } = await searchParams;
  const weekOffset = Number.parseInt(week ?? "0", 10) || 0;

  const now = new Date();
  const weekStart = addWeeks(startOfWeek(now, { weekStartsOn: 1 }), weekOffset);
  const weekEnd = addWeeks(endOfWeek(now, { weekStartsOn: 1 }), weekOffset);
  const sevenDaysAgo = subDays(now, 7).toISOString();

  const [{ data: coachStudents }, { data: slots }, { data: pendingAppointments }] = await Promise.all([
    admin
      .from("CoachStudent")
      .select("studentId, student:User!CoachStudent_studentId_fkey(id, name, email)")
      .eq("coachId", userId)
      .eq("orgId", orgId)
      .eq("status", "ACTIVE"),
    admin
      .from("AppointmentSlot")
      .select("id, startTime, endTime, status, appointment:Appointment(id, status, studentId, student:User!Appointment_studentId_fkey(id, name))")
      .eq("coachId", userId)
      .gte("startTime", weekStart.toISOString())
      .lte("endTime", weekEnd.toISOString())
      .order("startTime", { ascending: true }),
    admin
      .from("Appointment")
      .select("id, notes, student:User!Appointment_studentId_fkey(id, name), slot:AppointmentSlot(id, startTime, endTime)")
      .eq("coachId", userId)
      .eq("status", "PENDING")
      .order("createdAt", { ascending: true }),
  ]);

  const studentIds = (coachStudents ?? []).map((cs) => cs.studentId);

  // Fetch workout counts and food days for each student in the past 7 days
  const [{ data: workoutLogs }, { data: foodEntries }] = studentIds.length > 0
    ? await Promise.all([
        admin
          .from("WorkoutLog")
          .select("userId")
          .in("userId", studentIds)
          .gte("date", sevenDaysAgo),
        admin
          .from("FoodEntry")
          .select("userId, date")
          .in("userId", studentIds)
          .gte("date", sevenDaysAgo),
      ])
    : [{ data: [] }, { data: [] }];

  // Aggregate per student
  const workoutCountByStudent: Record<string, number> = {};
  const foodDaysByStudent: Record<string, Set<string>> = {};

  for (const log of workoutLogs ?? []) {
    workoutCountByStudent[log.userId] = (workoutCountByStudent[log.userId] ?? 0) + 1;
  }
  for (const entry of foodEntries ?? []) {
    const day = new Date(entry.date).toISOString().split("T")[0];
    if (!foodDaysByStudent[entry.userId]) foodDaysByStudent[entry.userId] = new Set();
    foodDaysByStudent[entry.userId].add(day);
  }

  const students = (coachStudents ?? []).map((cs) => {
    const s = cs.student as unknown as { id: string; name: string | null; email: string } | null;
    return {
      id: cs.studentId,
      name: s?.name ?? s?.email ?? cs.studentId,
      weeklyWorkouts: workoutCountByStudent[cs.studentId] ?? 0,
      foodDays: foodDaysByStudent[cs.studentId]?.size ?? 0,
    };
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">教練總覽</h1>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-300">待確認預約</h2>
        <PendingAppointments
          appointments={(pendingAppointments ?? []) as unknown as Parameters<typeof PendingAppointments>[0]["appointments"]}
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-300">我的學員</h2>
          <StudentProgressList students={students} />
        </section>
        <section>
          <div className="flex items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-300">
              {weekOffset === 0 ? "本週行程" : "行程"}
            </h2>
            <div className="ml-auto flex items-center gap-2 text-sm">
              {weekOffset !== 0 && (
                <Link
                  href="/dashboard/coach"
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  回到本週
                </Link>
              )}
              <Link
                href={`/dashboard/coach?week=${weekOffset - 1}`}
                aria-label="上一週"
                className="px-1.5 text-lg leading-none text-gray-500 hover:text-white transition-colors"
              >
                ‹
              </Link>
              <span className="text-gray-400">
                {format(weekStart, "M/d")} – {format(weekEnd, "M/d")}
              </span>
              <Link
                href={`/dashboard/coach?week=${weekOffset + 1}`}
                aria-label="下一週"
                className="px-1.5 text-lg leading-none text-gray-500 hover:text-white transition-colors"
              >
                ›
              </Link>
            </div>
          </div>
          <WeeklySchedule
            slots={(slots ?? []) as unknown as Parameters<typeof WeeklySchedule>[0]["slots"]}
            coachId={userId}
            weekStartIso={weekStart.toISOString()}
          />
        </section>
      </div>
    </div>
  );
}
