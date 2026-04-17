import type { Birthday } from "@/types";

const today = new Date();
function dateOffset(days: number, year = 1995) {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return `${year}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const seedBirthdays: Birthday[] = [
  { id: "b1", name: "Maya Chen", date: dateOffset(2, 1996), notes: "Loves matcha + film cameras", createdAt: Date.now() },
  { id: "b2", name: "Jordan Reeves", date: dateOffset(7, 1993), notes: "", createdAt: Date.now() },
  { id: "b3", name: "Amara Okafor", date: dateOffset(14, 1998), notes: "Sister", createdAt: Date.now() },
  { id: "b4", name: "Leo Martinez", date: dateOffset(28, 1990), notes: "College roommate", createdAt: Date.now() },
  { id: "b5", name: "Priya Shah", date: dateOffset(45, 1997), notes: "", createdAt: Date.now() },
];
