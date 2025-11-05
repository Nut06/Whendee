export type PlanStatus = "noDate" | "noDateSelected";
export type Candidate = { id: string; name: string };

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
  // ที่อยู่ของสถานที่ (ถ้ามี) สำหรับจอ select-date
  locationAddress?: string;
  // ✅ วันที่ว่างของผู้ใช้ (หลายวันได้)
  freeDates?: string[]; // e.g. ["2025-02-10","2025-02-11"]
};

type Listener = () => void;
const uid = () => Math.random().toString(36).slice(2, 9);

class PlanStore {
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
