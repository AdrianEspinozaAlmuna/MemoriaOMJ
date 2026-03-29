import React from "react";
import { createPortal } from "react-dom";

export default function Modal({
  isOpen,
  title,
  children,
  onClose,
  footer,
  hideHeader = false,
  overlayClassName = "",
  panelClassName = "",
  headerClassName = "",
  contentClassName = "",
  footerClassName = "",
  closeButtonClassName = ""
}) {
  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  const overlayClasses = `fixed inset-0 z-[80] grid place-items-center bg-[rgba(18,27,35,0.34)] p-4 animate-[fadeIn_0.18s_ease] ${overlayClassName}`.trim();
  const panelClasses = `w-full max-w-[560px] overflow-hidden rounded-[10px] border border-[#d6dde3] bg-[var(--surface)] shadow-[0_22px_44px_-26px_rgba(19,38,29,0.48)] ${panelClassName}`.trim();
  const headerClasses = `flex items-center justify-between gap-4 px-4 pb-2 pt-4 ${headerClassName}`.trim();
  const contentClasses = `px-4 pb-4 pt-1.5 ${contentClassName}`.trim();
  const footerClasses = `flex justify-end gap-2 border-t border-[var(--border)] px-4 pb-4 pt-3.5 ${footerClassName}`.trim();
  const closeClasses = `h-8 w-8 cursor-pointer rounded-[7px] border border-[#d5dce2] bg-white text-base text-[#385348] ${closeButtonClassName}`.trim();

  return createPortal(
    <div className={overlayClasses} role="dialog" aria-modal="true" aria-label={title}>
      <div className={panelClasses}>
        {!hideHeader && (
          <header className={headerClasses}>
            <h3 className="m-0">{title}</h3>
            <button type="button" className={closeClasses} onClick={onClose} aria-label="Cerrar modal">
              x
            </button>
          </header>
        )}
        <div className={contentClasses}>{children}</div>
        {footer && <div className={footerClasses}>{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
