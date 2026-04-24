import React from "react";

export default function LoadingState({
  title = "Cargando",
  description = "Estamos preparando la información.",
  minHeightClass = "min-h-[180px]",
  className = ""
}) {
  return (
    <article className={`rounded-xl border border-[#d8e6dd] bg-[var(--bg)] p-5 ${className}`} role="status" aria-live="polite">
      <div className={`grid place-items-center text-center ${minHeightClass}`}>
        <div className="w-full max-w-[360px] space-y-4">
          <div className="mx-auto relative inline-flex h-14 w-14 items-center justify-center" aria-hidden="true">
            <span className="absolute h-14 w-14 rounded-full border-4 border-[#d7e9df]" />
            <span className="absolute h-14 w-14 animate-spin rounded-full border-4 border-transparent border-t-[var(--primary)] border-r-[var(--primary)]" />
            <span className="h-5 w-5 rounded-full bg-[var(--primary)]/15" />
          </div>

          <div className="space-y-1.5">
            <p className="m-0 text-[0.98rem] font-semibold text-[var(--text)]">{title}</p>
            <p className="m-0 text-[0.88rem] text-[var(--text-muted)]">{description}</p>
          </div>

          <div className="relative w-full overflow-hidden rounded-full bg-[#e8f1eb]">
            <div className="loading-slide-bar h-1.5 w-[38%] rounded-full bg-[var(--primary)]" />
          </div>
        </div>
      </div>
    </article>
  );
}