import React from "react";

function MetricIcon({ metricKey }) {
  if (metricKey === "enrolled" || metricKey === "totalEnrolled") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M10 5h10M10 12h10M10 19h10M5 6.5l.9.9 1.8-1.8M5 13.5l.9.9 1.8-1.8M5 20.5l.9.9 1.8-1.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (metricKey === "monthAttendance" || metricKey === "month" || metricKey === "completed") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M7 4v3M17 4v3M4 9h16M6 7h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m5 16 4-4 3 3 7-7M15 8h4v4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function DashboardCards({ items = [], loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3" aria-live="polite">
        {Array.from({ length: 3 }).map((_, index) => (
          <article key={`sk-card-${index}`} className="min-h-[104px] rounded-xl border border-[#d9e4dd] bg-[linear-gradient(180deg,#f3f8f5,#edf4f0)]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {items.map(item => (
        <article key={item.key} className="rounded-xl border border-[#d3e1d9] bg-[linear-gradient(145deg,#ffffff_0%,#f4faf7_100%)] px-5 py-4 shadow-[0_10px_24px_-26px_rgba(8,38,23,0.44)]">
          <div className="flex items-center justify-between gap-3">
            <p className="m-0 text-[0.85rem] font-medium text-[var(--text-muted)]">{item.label}</p>
            <span
              className={`inline-flex h-8 w-8 flex-none items-center justify-center rounded-full text-white shadow-[0_8px_14px_-10px_rgba(4,96,45,0.55)] ${
                item.key === "attendanceRate" || item.key === "rate"
                  ? "bg-[linear-gradient(135deg,var(--primary-soft),var(--primary))]"
                  : item.key === "month" || item.key === "monthAttendance" || item.key === "completed"
                    ? "bg-[linear-gradient(135deg,var(--primary),var(--primary-strong))]"
                    : "bg-[linear-gradient(135deg,#0b9e4b,#067c38)]"
              }`}
            >
              <span className="h-4 w-4">
                <MetricIcon metricKey={item.key} />
              </span>
            </span>
          </div>
          <h3 className="mb-0 mt-2 text-[clamp(1.6rem,2.45vw,2rem)] font-bold text-[#163d2a]">{item.value}</h3>
        </article>
      ))}
    </div>
  );
}
