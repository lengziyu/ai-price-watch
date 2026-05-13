type AdminPageHeaderProps = {
  kicker: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
};

export function AdminPageHeader({
  kicker,
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <section className="admin-hero motion-surface motion-surface--green animate-fade-up">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-[760px]">
          <div className="mono-kicker text-[12px] uppercase text-muted-foreground">{kicker}</div>
          <h1 className="mt-2 text-[1.6rem] font-semibold leading-[0.96] tracking-[-0.05em] text-foreground sm:text-[2.2rem]">
            {title}
          </h1>
          <p className="mt-3 max-w-[680px] text-[13px] leading-6 text-muted-foreground">
            {description}
          </p>
        </div>

        {actions ? <div className="w-full lg:max-w-[460px]">{actions}</div> : null}
      </div>
    </section>
  );
}
