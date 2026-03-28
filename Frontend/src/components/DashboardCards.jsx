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
        <article key={item.key} className="rounded-xl border border-[#d7e2db] bg-[linear-gradient(180deg,#ffffff_0%,#f7fbf9_100%)] px-5 py-4 shadow-[0_10px_24px_-26px_rgba(8,38,23,0.48)]">
          <div className="flex items-center justify-between gap-3">
            <p className="m-0 text-[0.85rem] font-medium text-[var(--text-muted)]">{item.label}</p>
            <span
              className={`inline-flex h-[2.15rem] w-[2.15rem] flex-none items-center justify-center rounded-full border border-[#cfe0d6] bg-[#edf7f1] text-[var(--primary-strong)] ${
                item.key === "attendanceRate" || item.key === "rate"
                  ? "border-[#ecd99a] bg-[#fff7dd] text-[#8b6a10]"
                  : item.key === "month" || item.key === "monthAttendance" || item.key === "completed"
                    ? "border-[#bfd8f1] bg-[#e9f4ff] text-[#2e6e9f]"
                    : ""
              }`}
            >
              <MetricIcon metricKey={item.key} />
            </span>
          </div>
          <h3 className="mb-0 mt-2 text-[clamp(1.6rem,2.45vw,2rem)] font-bold text-[#163d2a]">{item.value}</h3>
        </article>
      ))}
    </div>
  );
}
