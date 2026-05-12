import { cn } from "@/lib/utils";
import { AnimatedSectionTitle } from "@/components/shared/animated-section-title";

type SectionHeadingProps = {
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
      )}
    >
      <AnimatedSectionTitle className="text-[1.9rem] sm:text-[2.6rem]">
        {title}
      </AnimatedSectionTitle>
      {description ? (
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
