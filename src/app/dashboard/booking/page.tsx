import { requireAuth } from "@/lib/auth-helpers";
import { createAdminClient } from "@/lib/supabase/server";
import { expireStalePending } from "@/lib/appointments";
import BookingSlotList from "@/components/booking/booking-slot-list";
import MyAppointmentList from "@/components/booking/my-appointment-list";

export default async function BookingPage() {
  const user = await requireAuth();
  const admin = await createAdminClient();

  const { data: membership } = await admin
    .from("OrganizationMember")
    .select("orgId, org:Organization(bookingCutoffHours)")
    .eq("userId", user.id)
    .single();

  const orgId = membership?.orgId ?? null;
  const cutoffHours = (membership?.org as unknown as { bookingCutoffHours: number } | null)?.bookingCutoffHours ?? 2;

  if (orgId) await expireStalePending(orgId);

  const [{ data: slots }, { data: appointments }] = await Promise.all([
    orgId
      ? admin
          .from("AppointmentSlot")
          .select("id, startTime, endTime, status, coach:User!AppointmentSlot_coachId_fkey(id, name)")
          .eq("orgId", orgId)
          .eq("status", "OPEN")
          .order("startTime", { ascending: true })
      : { data: [] },
    admin
      .from("Appointment")
      .select("id, status, notes, rejectedReason, createdAt, slot:AppointmentSlot(id, startTime, endTime), coach:User!Appointment_coachId_fkey(id, name)")
      .eq("studentId", user.id)
      .order("createdAt", { ascending: false }),
  ]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">預約課程</h1>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3 text-gray-300">可預約時段</h2>
        <BookingSlotList
          slots={(slots ?? []) as unknown as Parameters<typeof BookingSlotList>[0]["slots"]}
          cutoffHours={cutoffHours}
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3 text-gray-300">我的預約</h2>
        <MyAppointmentList
          appointments={(appointments ?? []) as unknown as Parameters<typeof MyAppointmentList>[0]["appointments"]}
        />
      </section>
    </div>
  );
}
