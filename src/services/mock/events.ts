
import { Event, EventStatus } from "@/types";

export const events: Event[] = [
  {
    id: "event1",
    date: "2025-04-20",
    status: EventStatus.PREPARATION,
    productTypes: [],
    createdAt: "2025-04-10T10:00:00Z",
    randomizationComplete: false
  },
  {
    id: "event2",
    date: "2025-04-15",
    status: EventStatus.ACTIVE,
    productTypes: [],
    createdAt: "2025-04-08T14:30:00Z",
    randomizationComplete: true
  }
];
