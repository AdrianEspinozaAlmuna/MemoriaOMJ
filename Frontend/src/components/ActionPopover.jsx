import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ActionPopover({ anchorRef, open, width = 220, children, onClose }) {
  const [pos, setPos] = useState(null);

  useEffect(() => {
    if (!open) return setPos(null);

    function update() {
      const anchor = anchorRef?.current;
      if (!anchor) return setPos(null);
      const rect = anchor.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      const scrollX = window.scrollX || window.pageXOffset;

      const left = Math.min(Math.max(rect.left + rect.width - width, 8), window.innerWidth - width - 8) + scrollX;
      const top = rect.bottom + scrollY - 8;
      setPos({ left, top });
    }

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [open, anchorRef, width]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !pos) return null;

  return createPortal(
    <div style={{ position: "absolute", left: pos.left, top: pos.top, zIndex: 99999 }}>
      <div className="w-[220px] rounded-md border border-[#dce3ea] bg-white p-1.5 shadow-[0_14px_24px_-20px_rgba(10,43,26,0.55)]">
        {children}
      </div>
    </div>,
    document.body
  );
}
