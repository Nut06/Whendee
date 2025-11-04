// app/lib/planStore.ts
export type PlanStatus = "noDate" | "noDateSelected";
export type Candidate = { id: string; name: string };

export type Plan = {
  id: string;
  title: string;
  meetingId: string;
  participants: number;
  status: PlanStatus;

  // ชื่อสถานที่ที่เลือก/ชนะโหวต
  locationName?: string;

  // บรรทัดอธิบายใต้ชื่อ (เช่น ที่อยู่) — ใช้ใน select-date.tsx
  locationAddress?: string;

  // เก็บพิกัดเต็ม (ใช้กับหน้า Set Location)
  location?: { name: string; lat: number; lng: number; address?: string };

  // รายการตัวเลือกสำหรับหน้าโหวต
  candidateLocations: Candidate[];
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
      candidateLocations: [
        { id: uid(), name: "Downtown" },
        { id: uid(), name: "Barclays Center" },
      ],
    },
  ];

  private listeners = new Set<Listener>();

  // ---------- getters ----------
  getAll() {
    return this.plans;
  }
  getByMeetingId(meetingId: string) {
    return this.plans.find((p) => p.meetingId === meetingId);
  }
  getCandidates(meetingId: string): Candidate[] {
    return this.getByMeetingId(meetingId)?.candidateLocations ?? [];
  }

  // ---------- mutations ----------
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

  /**
   * ตั้งสถานที่ (ชื่อ/ที่อยู่) — ใช้เวลาเลือกจากโหวต หรือกรอกชื่อธรรมดา
   * รองรับทั้ง string (ชื่ออย่างเดียว) หรือ { name, address }
   * และอัปเดตสถานะเป็น noDateSelected (เลือกสถานที่แล้ว รอเลือกวัน)
   */
  setLocation(meetingId: string, value: string | { name: string; address?: string }) {
    const p = this.getByMeetingId(meetingId);
    if (!p) return;

    const name = (typeof value === "string" ? value : value.name)?.trim();
    const address = typeof value === "string" ? undefined : value.address?.trim();
    if (!name) return;

    p.locationName = name;
    if (address !== undefined) p.locationAddress = address;

    // ปรับสถานะ: เลือกสถานที่แล้ว → รอเลือกวัน
    p.status = "noDateSelected";

    // เติมลง candidate ถ้ายังไม่มี
    const exists = p.candidateLocations.some(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    if (!exists) p.candidateLocations.push({ id: uid(), name });

    this.emit();
  }

  /**
   * ตั้งสถานที่พร้อมพิกัด — ใช้จากหน้า Set Location (แผนที่)
   */
  setLocationWithCoords(
    meetingId: string,
    loc: { name: string; lat: number; lng: number; address?: string }
  ) {
    const p = this.getByMeetingId(meetingId);
    if (!p) return;

    const name = loc.name?.trim();
    if (!name) return;

    p.locationName = name;
    p.locationAddress = loc.address ?? p.locationAddress;
    p.location = { name, lat: loc.lat, lng: loc.lng, address: loc.address };
    p.status = "noDateSelected";

    const exists = p.candidateLocations.some(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    if (!exists) p.candidateLocations.push({ id: uid(), name });

    this.emit();
  }

  // ---------- subscribe ----------
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
