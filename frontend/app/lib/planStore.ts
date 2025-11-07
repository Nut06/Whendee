// libs/planStore.ts
import type { Event, PollOption, EventMember } from "@/types/event.type";

export type PlanStatus = "noDate" | "noDateSelected";
export type Candidate = { id: string; name: string };

export type MeetingDetails = {
  agenda: string;
  repeat: string;        // e.g. "All Days", "Weekdays"
  budget?: number;       // in THB (or app's currency)
  alert?: string;        // e.g. "15 min before"
  members?: string[];    // user ids invited
  link?: string;         // meeting link/url
  finalDate?: string;    // YYYY-MM-DD เลือกวันสุดท้ายของแผน
};

export type Plan = {
  id: string;
  title: string;
  meetingId: string;
  participants: number;
  status: PlanStatus;
  locationName?: string;            // ชื่อที่ชนะหลังโหวต
  candidateLocations: Candidate[];  // รายการตัวเลือกที่จะไปหน้าโหวต
  // เก็บพิกัดสถานที่ (ถ้ามี)
  location?: { name: string; lat: number; lng: number };
  // ✅ วันที่ว่างของผู้ใช้ (หลายวันได้)
  freeDates?: string[]; // e.g. ["2025-02-10","2025-02-11"]
  // ✅ รายละเอียดการนัดหมายที่หน้ากำหนดเวลา
  meetingDetails?: MeetingDetails;
  // id ที่สร้างจริงบน event-service
  backendEventId?: string;
  members?: EventMember[];
};

type Listener = () => void;
const uid = () => Math.random().toString(36).slice(2, 9);
const ALERT_MINUTES_TO_LABEL: { value: number; label: string }[] = [
  { value: 0, label: "At time of event" },
  { value: 5, label: "5 mins before" },
  { value: 10, label: "10 mins before" },
  { value: 15, label: "15 min before" },
  { value: 30, label: "30 mins before" },
  { value: 60, label: "1 hours before" },
  { value: 120, label: "2 hours before" },
  { value: 1440, label: "1 day before" },
  { value: 2880, label: "2 day before" },
  { value: 10080, label: "1 week before" },
];

class PlanStore {
  // เก็บวันว่างแยกตามผู้ใช้: freeDatesByUser[meetingId][userId] = ["YYYY-MM-DD", ...]
  private freeDatesByUser: Record<string, Record<string, string[]>> = {};
  private currentUserId: string = "u1"; // mock ผู้ใช้ปัจจุบัน (Aliya)
  private plans: Plan[] = [];

  private listeners = new Set<Listener>();

  // -------- getters --------
  getAll() {
    return this.plans;
  }
  getByMeetingId(meetingId: string) {
    return this.plans.find((p) => p.meetingId === meetingId);
  }
  getCandidates(meetingId: string): Candidate[] {
    return this.getByMeetingId(meetingId)?.candidateLocations ?? [];
  }
  getMeetingDetails(meetingId: string): MeetingDetails | undefined {
    return this.getByMeetingId(meetingId)?.meetingDetails;
  }
  // เปลี่ยนชื่อแผน
  setPlanTitle(meetingId: string, title: string) {
    const p = this.getByMeetingId(meetingId);
    if (!p) return;
    const t = (title ?? "").trim();
    if (!t || t === p.title) return;
    p.title = t;
    this.emit();
  }
  // ผู้ใช้ทั้งหมดที่เคยบันทึกวันว่างใน meeting นี้
  getAllUsersWithFreeDates(meetingId: string): string[] {
    const mid = meetingId.trim();
    return Object.keys(this.freeDatesByUser[mid] ?? {});
  }
  getBackendEventId(meetingId: string) {
    return this.getByMeetingId(meetingId)?.backendEventId;
  }

  // -------- mutations --------
  addCandidate(meetingId: string, name: string, id?: string) {
    const p = this.getByMeetingId(meetingId);
    if (!p) return;
    const n = name.trim();
    if (!n) return;

    const exists = p.candidateLocations.some(
      (c) => c.name.toLowerCase() === n.toLowerCase()
    );
    if (!exists) {
      p.candidateLocations.push({ id: id ?? uid(), name: n });
      this.emit();
    }
  }

  setCandidates(meetingId: string, candidates: Candidate[]) {
    const p = this.getByMeetingId(meetingId);
    if (!p) return;
    p.candidateLocations = candidates;
    this.emit();
  }

  setLocation(meetingId: string, name: string) {
    const p = this.getByMeetingId(meetingId);
    if (!p) return;
    const n = name.trim();
    if (!n) return;

    p.locationName = n;
    const exists = p.candidateLocations.some(
      (c) => c.name.toLowerCase() === n.toLowerCase()
    );
    if (!exists) {
      p.candidateLocations.push({ id: uid(), name: n });
    }
    this.emit();
  }

  setLocationWithCoords(meetingId: string, loc: { name: string; lat: number; lng: number }) {
    const p = this.getByMeetingId(meetingId);
    if (!p) return;
    const n = (loc.name ?? "").trim();
    if (!n) return;

    p.locationName = n;
    p.location = { name: n, lat: loc.lat, lng: loc.lng };

    const exists = p.candidateLocations.some(
      (c) => c.name.toLowerCase() === n.toLowerCase()
    );
    if (!exists) {
      p.candidateLocations.push({ id: uid(), name: n });
    }
    this.emit();
  }

  // ✅ บันทึก "วันที่ว่าง" หลายวัน
  setFreeDates(meetingId: string, dates: string[]) {
    const p = this.getByMeetingId(meetingId);
    if (!p) return;
    // เก็บแบบ unique + sort
    const uniq = Array.from(new Set(dates)).sort();
    p.freeDates = uniq;
    this.emit();
  }

  // ✅ บันทึกรายละเอียดการนัดหมาย (agenda, repeat, budget, alert, members, link)
  setMeetingDetails(meetingId: string, details: Partial<MeetingDetails>) {
    const p = this.getByMeetingId(meetingId);
    if (!p) return;
    const current = p.meetingDetails ?? {
      agenda: "",
      repeat: "",
      budget: undefined,
      alert: undefined,
      members: [],
      link: undefined,
    } as MeetingDetails;

    // Normalize budget if provided as string
    let normalized: Partial<MeetingDetails> = { ...details };
    if (typeof details.budget === "string") {
      const digits = (details.budget as unknown as string).replace(/[^0-9.]/g, "");
      const num = digits ? Number(digits) : undefined;
      normalized.budget = Number.isFinite(num!) ? (num as number) : undefined;
    }

    p.meetingDetails = { ...current, ...normalized };
    this.emit();
  }

  setBackendEventId(meetingId: string, backendId: string) {
    const p = this.getByMeetingId(meetingId);
    if (!p) return;
    if (p.backendEventId === backendId) return;
    p.backendEventId = backendId;
    this.emit();
  }

  private generateReadableMeetingId(): string {
    const digits = Array.from({ length: 12 }, () =>
      Math.floor(Math.random() * 10),
    ).join("");
    return digits.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
  }

  private formatMeetingIdFromEvent(eventId: string): string {
    const digits = eventId.replace(/\D/g, "").slice(0, 12);
    if (!digits) return eventId;
    return digits.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
  }

  createPlan(initial?: Partial<Omit<Plan, "id">>) {
    const meetingId = initial?.meetingId ?? this.generateReadableMeetingId();
    const plan: Plan = {
      id: uid(),
      title: initial?.title ?? "Untitled plan",
      meetingId,
      participants: initial?.participants ?? 1,
      status: initial?.status ?? "noDate",
      locationName: initial?.locationName,
      candidateLocations: initial?.candidateLocations ?? [],
      location: initial?.location,
      freeDates: initial?.freeDates ?? [],
      meetingDetails: initial?.meetingDetails,
      backendEventId: initial?.backendEventId,
    };
    this.plans.unshift(plan);
    this.emit();
    return meetingId;
  }

  loadFromBackend(events: Event[]) {
    const updated: Plan[] = [];

    events.forEach((event) => {
      const mapped = this.mapEventToPlan(event);
      const existing = this.plans.find((p) => p.backendEventId === event.id);

      if (existing) {
        const merged: Plan = {
          ...existing,
          ...mapped,
          meetingId: existing.meetingId,
          freeDates: existing.freeDates ?? mapped.freeDates,
          meetingDetails: {
            ...mapped.meetingDetails,
            ...existing.meetingDetails,
          },
        };
        updated.push(merged);
      } else {
        updated.push(mapped);
      }
    });

    const localDrafts = this.plans.filter((plan) => !plan.backendEventId);
    this.plans = [...updated, ...localDrafts];
    this.emit();
  }

  private mapEventToPlan(event: Event): Plan {
    const acceptedCount =
      event.members?.filter((member) => member.status === "ACCEPTED")
        .length ?? 0;
    const finalDate = event.scheduledAt
      ? event.scheduledAt.slice(0, 10)
      : undefined;
    return {
      id: event.id,
      title: event.title,
      meetingId: this.formatMeetingIdFromEvent(event.id),
      participants: acceptedCount || event.members?.length || 0,
      status: finalDate ? "noDateSelected" : "noDate",
      locationName: event.location ?? undefined,
      candidateLocations: [],
      freeDates: finalDate ? [finalDate] : [],
      meetingDetails: {
        agenda: event.eventDescription,
        repeat: event.repeat ?? "",
        budget: event.budget ?? undefined,
        alert: this.formatAlertLabel(event.alertMinutes),
        members: event.members?.map((m) => m.userId) ?? [],
        link: event.meetingLink ?? undefined,
        finalDate,
      },
      backendEventId: event.id,
      members: event.members ?? [],
    };
  }

  private formatAlertLabel(minutes?: number | null) {
    if (minutes == null) return undefined;
    const preset = ALERT_MINUTES_TO_LABEL.find(
      (entry) => entry.value === minutes,
    );
    if (preset) return preset.label;
    if (minutes % 60 === 0) {
      const hours = minutes / 60;
      return `${hours} hours before`;
    }
    return `${minutes} mins before`;
  }

  // ---------- ต่อผู้ใช้จริง ----------
  setCurrentUser(userId: string) {
    this.currentUserId = userId.trim() || this.currentUserId;
  }
  getCurrentUserId() {
    return this.currentUserId;
  }
  upsertMember(meetingId: string, member: EventMember) {
    const plan = this.getByMeetingId(meetingId);
    if (!plan) return;
    if (!plan.members) plan.members = [];
    const idx = plan.members.findIndex((m) => m.userId === member.userId);
    if (idx >= 0) {
      plan.members[idx] = { ...plan.members[idx], ...member };
    } else {
      plan.members.push(member);
    }
    plan.participants =
      plan.members.filter((m) => m.status === "ACCEPTED").length ||
      plan.participants;
    this.emit();
  }

  setUserFreeDates(meetingId: string, userId: string, dates: string[]) {
    const mid = meetingId.trim();
    const uid = userId.trim();
    if (!mid || !uid) return;
    if (!this.freeDatesByUser[mid]) this.freeDatesByUser[mid] = {};
    const uniq = Array.from(new Set(dates.filter(Boolean))).sort();
    this.freeDatesByUser[mid][uid] = uniq;
    this.emit();
  }
  getUserFreeDates(meetingId: string, userId: string): string[] {
    const mid = meetingId.trim();
    const uid = userId.trim();
    return this.freeDatesByUser[mid]?.[uid] ?? [];
  }
  hasUserFreeDates(meetingId: string, userId: string): boolean {
    return this.getUserFreeDates(meetingId, userId).length > 0;
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }
  private emit() {
    this.listeners.forEach((fn) => fn());
  }
  mapPollOptionsToCandidates(options: PollOption[]): Candidate[] {
    return options.map((option) => ({ id: option.id, name: option.label }));
  }
}

const planStore = new PlanStore();
export default planStore;
