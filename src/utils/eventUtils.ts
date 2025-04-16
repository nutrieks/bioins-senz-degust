
import { EventStatus } from "@/types";

export function getStatusLabel(status: EventStatus) {
  switch (status) {
    case EventStatus.PREPARATION:
      return "Priprema";
    case EventStatus.ACTIVE:
      return "Aktivan";
    case EventStatus.COMPLETED:
      return "Završen";
    case EventStatus.ARCHIVED:
      return "Arhiviran";
    default:
      return "Nepoznat";
  }
}
