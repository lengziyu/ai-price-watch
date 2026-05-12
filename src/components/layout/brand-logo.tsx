import { siteConfig } from "@/lib/site";

type BrandLogoProps = {
  compact?: boolean;
};

export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" role="img">
          <circle cx="16" cy="16" r="10.5" fill="none" stroke="currentColor" strokeWidth="2.2" opacity="0.9" />
          <circle cx="16" cy="16" r="5.4" fill="none" stroke="currentColor" strokeWidth="2.2" opacity="0.62" />
          <path d="M16 16 25 11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="25" cy="11" r="1.8" fill="currentColor" />
          <path d="M15.2 8h4.1L16.3 14h3.5l-6.2 10 1.8-7h-3.4l3.2-9Z" fill="currentColor" />
        </svg>
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-[15px] font-semibold tracking-tight">
          {siteConfig.name}
        </span>
        {compact ? null : (
          <span className="hidden text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground sm:block">
            {siteConfig.englishName}
          </span>
        )}
      </span>
    </div>
  );
}
