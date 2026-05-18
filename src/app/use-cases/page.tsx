import type { Metadata } from "next";

import { PageHero } from "@/components/shared/page-hero";
import { PageShowcase } from "@/components/shared/page-showcase";
import { ScrambleText } from "@/components/shared/scramble-text";
import { UseCasesBoard } from "@/components/use-cases/use-cases-board";

export const metadata: Metadata = {
  title: "AI 使用场景推荐",
  description: "按开发、写作、学习、研究、自动化和创意任务查看推荐工具与模型组合。",
};

type UseCasesPageProps = {
  searchParams?: Promise<{
    group?: string;
  }>;
};

export default async function UseCasesPage({ searchParams }: UseCasesPageProps) {
  const params = (await searchParams) ?? {};

  return (
    <div className="pb-8 sm:pb-16">
      <PageHero
        note="写作 · 编程 · 学习 · 办公"
        title={
          <>
            <div>
              <ScrambleText text="AI 使用场景" />
            </div>
            <div className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <ScrambleText text="按任务选择" />
              <ScrambleText text="更省预算" className="gradient-title" />
            </div>
          </>
        }
        description={
          <>
            不只告诉你“能做什么”，也告诉你“该把预算放在哪”。
            <br />
            先按任务类型切换，再回到订阅和 Token 页面做更细的成本决策。
          </>
        }
        primaryAction={{ href: "#use-cases-board", label: "查看场景分类" }}
        secondaryAction={{ href: "/pricing/subscriptions", label: "去看订阅页" }}
        rightSlot={<PageShowcase variant="use-cases" />}
      />

      <UseCasesBoard
        key={params.group ?? "all"}
        defaultGroup={params.group}
      />
    </div>
  );
}
