// libs/planStore.ts
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
};

type Listener = () => void;
const uid = () => Math.random().toString(36).slice(2, 9);

class PlanStore {
  // เก็บวันว่างแยกตามผู้ใช้: freeDatesByUser[meetingId][userId] = ["YYYY-MM-DD", ...]
  private freeDatesByUser: Record<string, Record<string, string[]>> = {};
  private currentUserId: string = "u1"; // mock ผู้ใช้ปัจจุบัน (Aliya)
  private plans: Plan[] = [
    {
      id: "p1",
      title: "New Year trip",
      meetingId: "213 2432 4423",
      participants: 5,
      status: "noDate",
      candidateLocations: [],
      freeDates: [],
    },
    {
      id: "p2",
      title: "Develop a new website page for product testimonials",
      meetingId: "763 8965 3605",
      participants: 5,
      status: "noDateSelected",
      locationName: undefined,
      candidateLocations: [
        { id: uid(), name: "Downtown" },
        { id: uid(), name: "Barclays Center" },
      ],
      freeDates: [],
    },
  ];

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

  // -------- mutations --------
  addCandidate(meetingId: string, name: string) {
    const p = this.getByMeetingId(meetingId);
    if (!p) return;
    const n = name.trim();
    if (!n) return;

    const exists = p.candidateLocations.some(
      (c) => c.name.toLowerCase() === n.toLowerCase()
    );
    if (!exists) {
      p.candidateLocations.push({ id: uid(), name: n });
      this.emit();
    }
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

  // ---------- ต่อผู้ใช้จริง ----------
  setCurrentUser(userId: string) {
    this.currentUserId = userId.trim() || this.currentUserId;
  }
  getCurrentUserId() {
    return this.currentUserId;
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
}

const planStore = new PlanStore();
export default planStore;
