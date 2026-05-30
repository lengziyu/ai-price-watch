import type { ElementType } from "react";
import { SparklesIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type AnimatedSectionTitleProps = {
  as?: ElementType;
  children: string;
  className?: string;
};

export function AnimatedSectionTitle({
  as,
  children,
  className,
}: AnimatedSectionTitleProps) {
  const Component = as ?? "h2";

  return (
    <Component
      className={cn("animated-section-title", className)}
      aria-label={children}
    >
      <span className="animated-section-title__copy" aria-hidden="true">
        <span className="animated-section-title__baseline">{children}</span>
        <span className="animated-section-title__glow">{children}</span>
      </span>
      <SparklesIcon
        aria-hidden="true"
        className="animated-section-title__spark animated-section-title__spark--one"
      />
      <SparklesIcon
        aria-hidden="true"
        className="animated-section-title__spark animated-section-title__spark--two"
      />
      <SparklesIcon
        aria-hidden="true"
        className="animated-section-title__spark animated-section-title__spark--three"
      />
    </Component>
  );
}
