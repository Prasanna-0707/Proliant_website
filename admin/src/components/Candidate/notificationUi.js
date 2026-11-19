import {
  BriefcaseBusiness,
  CalendarDays,
  RefreshCw,
  Info,
} from "lucide-react";

export const notificationIcons = {
  APPLICATION: BriefcaseBusiness,
  INTERVIEW: CalendarDays,
  STATUS_UPDATE: RefreshCw,
  GENERAL: Info,
};

export const notificationStyles = {
  APPLICATION: "bg-red-50 text-red-500",
  INTERVIEW: "bg-blue-50 text-blue-600",
  STATUS_UPDATE: "bg-indigo-50 text-indigo-500",
  GENERAL: "bg-emerald-50 text-emerald-600",
};

// Tells every mounted bell / page to reload after a change.
export const notifyUpdated = () =>
  window.dispatchEvent(new Event("candidate-notifications-updated"));