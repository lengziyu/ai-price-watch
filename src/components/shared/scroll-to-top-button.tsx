"use client";

import { useEffect, useState } from "react";
import { ArrowUpIcon } from "lucide-react";

const showAfterScrollY = 500;

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisible = () => {
      setVisible(window.scrollY >= showAfterScrollY);
    };

    updateVisible();
    window.addEventListener("scroll", updateVisible, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateVisible);
    };
  }, []);

  return (
    <button
      type="button"
      aria-label="回到顶部"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={[
        "fixed bottom-6 right-6 z-[120] inline-flex h-11 w-11 items-center justify-center rounded-full",
        "border border-primary/25 bg-background/88 text-primary shadow-[0_14px_34px_rgba(15,23,42,0.16)] backdrop-blur-xl",
        "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-primary hover:text-white hover:shadow-[0_20px_38px_rgba(0,188,125,0.28)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2",
        visible
          ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-3 scale-90 opacity-0",
      ].join(" ")}
    >
      <ArrowUpIcon className="h-5 w-5" />
    </button>
  );
}
