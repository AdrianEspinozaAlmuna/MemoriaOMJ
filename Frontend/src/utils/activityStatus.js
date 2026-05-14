import { AlertCircle, BadgeCheck, Ban, CalendarCheck2, Clock3, PlayCircle, XCircle } from "lucide-react";

function normalizeStatus(valueOrActivity) {
  if (typeof valueOrActivity === "string") {
    return valueOrActivity.toLowerCase();
  }

  const raw = valueOrActivity?.state || valueOrActivity?.status || "";
  return String(raw).toLowerCase();
}

const STATUS_META = {
  pendiente: {
    label: "Pendiente",
    className: "border-[#facc15] bg-[#fef9c3] text-[#a16207]",
    textColor: "text-[#a16207]",
    icon: AlertCircle
  },
  programada: {
    label: "Programada",
    className: "border-[#2563eb] bg-[#dbeafe] text-[#1d4ed8]",
    textColor: "text-[#1d4ed8]",
    icon: CalendarCheck2
  },
  en_curso: {
    label: "En curso",
    className: "border-[#166534] bg-[#dcfce7] text-[#166534]",
    textColor: "text-[#166534]",
    icon: PlayCircle
  },
  finalizada: {
    label: "Finalizada",
    className: "border-[#14b8a6] bg-[#ccfbf1] text-[#0f766e]",
    textColor: "text-[#0f766e]",
    icon: BadgeCheck
  },
  rechazada: {
    label: "Rechazada",
    className: "border-[#dc2626] bg-[#fee2e2] text-[#991b1b]",
    textColor: "text-[#991b1b]",
    icon: XCircle
  },
  cancelada: {
    label: "Cancelada",
    className: "border-[#f97316] bg-[#ffedd5] text-[#c2410c]",
    textColor: "text-[#c2410c]",
    icon: Ban
  },
  inscrito: {
    label: "Inscrito",
    className: "border-[#9ec9ea] bg-[#e8f5ff] text-[#1f5f8b]",
    textColor: "text-[#1f5f8b]",
    icon: CalendarCheck2
  },
  disponible: {
    label: "Disponible",
    className: "border-[#bfe4cd] bg-[#e7f5ec] text-[#177945]",
    textColor: "text-[#177945]",
    icon: CalendarCheck2
  },
  default: {
    label: "Sin estado",
    className: "border-[#d8e6dd] bg-white text-[#496053]",
    textColor: "text-[#496053]",
    icon: AlertCircle
  }
};

export function getActivityStatusMeta(valueOrActivity) {
  const status = normalizeStatus(valueOrActivity);
  return STATUS_META[status] || STATUS_META.default;
}

export function getActivityStatusLabel(valueOrActivity) {
  return getActivityStatusMeta(valueOrActivity).label;
}

export function getActivityStatusClass(valueOrActivity) {
  return getActivityStatusMeta(valueOrActivity).className;
}

export function getActivityStatusTextClass(valueOrActivity) {
  return getActivityStatusMeta(valueOrActivity).textColor;
}

export function getActivityStatusIcon(valueOrActivity) {
  return getActivityStatusMeta(valueOrActivity).icon;
}

export function getActivityStatusValue(valueOrActivity) {
  return normalizeStatus(valueOrActivity);
}
