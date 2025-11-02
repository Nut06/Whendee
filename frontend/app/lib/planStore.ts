// libs/planStore.ts
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
    // กันกรณีชื่อนี้ยังไม่อยู่ใน candidate list
    const exists = p.candidateLocations.some(
      (c) => c.name.toLowerCase() === n.toLowerCase()
    );
    if (!exists) {
      p.candidateLocations.push({ id: uid(), name: n });
    }
    this.emit();
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  private emit() {
    this.listeners.forEach((fn) => fn());
  }
}

const planStore = new PlanStore();
export default planStore;
