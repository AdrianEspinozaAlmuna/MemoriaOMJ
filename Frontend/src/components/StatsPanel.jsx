import React from "react";
import { CalendarDays, CheckCircle2, TrendingUp, UserRound } from "lucide-react";

function StatIcon({ statKey }) {
  if (statKey === "rate") {
    return <TrendingUp aria-hidden="true" focusable="false" className="h-full w-full" strokeWidth={1.8} />;
  }

  if (statKey === "total") {
    return <CheckCircle2 aria-hidden="true" focusable="false" className="h-full w-full" strokeWidth={1.8} />;
  }

  if (statKey === "month") {
    return <CalendarDays aria-hidden="true" focusable="false" className="h-full w-full" strokeWidth={1.8} />;
  }

  return <UserRound aria-hidden="true" focusable="false" className="h-full w-full" strokeWidth={1.8} />;
}

function splitValue(statKey, value) {
  if (statKey !== "month" || typeof value !== "string") {
    return { main: value || "-", note: "" };
  }

  const match = value.match(/^(.*?)\s*\((.*?)\)$/);
  if (!match) {
    return { main: value || "-", note: "" };
  }

  return {
    main: match[1].trim(),
    note: match[2].trim()
  };
}

export default function StatsPanel({ stats = {} }) {
  const statItems = [
    { key: "rate", label: "Tasa de asistencia", value: stats.rate },
    { key: "total", label: "Total asistencias", value: stats.total },
    { key: "month", label: "Este mes", value: stats.month },
    { key: "streak", label: "Racha actual", value: stats.streak }
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {statItems.map(item => (
        <article key={item.key} className="rounded-xl border border-[#d8e3dc] bg-[linear-gradient(180deg,#ffffff_0%,#f8fcfa_100%)] p-4 shadow-[0_10px_22px_-26px_rgba(9,40,24,0.48)]">
          <div className="flex items-center justify-between gap-3">
            <p className="m-0 text-[0.83rem] text-[#6f8278]">{item.label}</p>
            <span
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#cee2d6] bg-[#edf7f1] text-[var(--primary-strong)] ${
                item.key === "total"
                  ? "border-[#c5dfd1] bg-[#eaf6ef] text-[#246b45]"
                  : item.key === "month"
                    ? "border-[#bfdecf] bg-[#e6f5ec] text-[#21673f]"
                    : "border-[#c2dfcb]"
              }`}
            >
              <span className="h-3.5 w-3.5">
                <StatIcon statKey={item.key} />
              </span>
            </span>
          </div>
          <h3 className="mb-0 mt-1.5 text-[1.12rem] font-bold text-[#153d2a]">{splitValue(item.key, item.value).main}</h3>
          {splitValue(item.key, item.value).note && <small className="mt-1 block text-[0.78rem] font-semibold text-[#376c50]">{splitValue(item.key, item.value).note}</small>}
        </article>
      ))}
    </div>
  );
}
