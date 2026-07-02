"use client";

import { useCallback, useState } from "react";
import MemberList from "@/components/admin/member-list";
import CoachPairingPanel from "@/components/admin/coach-pairing-panel";

export type MemberRow = {
  id: string;
  role: "OWNER" | "ADMIN" | "COACH" | "MEMBER";
  joinedAt: string;
  userId: string;
  user: { id: string; name: string | null; email: string } | null;
};

export type PairingRow = {
  id: string;
  status: string;
  coachId: string;
  studentId: string;
  student: { id: string; name: string | null; email: string } | null;
};

type Props = {
  initialMembers: MemberRow[];
  initialPairings: PairingRow[];
};

export default function MembersManager({
  initialMembers,
  initialPairings,
}: Props) {
  const [members, setMembers] = useState(initialMembers);
  const [pairings, setPairings] = useState(initialPairings);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/admin/members");
    if (!res.ok) return;
    const data = await res.json();
    setMembers(data.members ?? []);
    setPairings(data.pairings ?? []);
  }, []);

  return (
    <div className="space-y-8">
      <MemberList members={members} onChanged={refresh} />
      <CoachPairingPanel
        members={members}
        pairings={pairings}
        onChanged={refresh}
      />
    </div>
  );
}
