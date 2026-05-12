import type { ElementType } from "react";

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
      data-text={children}
      aria-label={children}
    >
      <span className="actual-text" aria-hidden="true">
        {children}
      </span>
      <span className="hover-text" aria-hidden="true">
        {children}
      </span>
    </Component>
  );
}
