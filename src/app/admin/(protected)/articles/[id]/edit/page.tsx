import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { notFound } from "next/navigation";

import { updateDealArticleAction } from "@/app/admin/actions";
import { AdminDealArticleForm } from "@/components/admin/admin-deal-article-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDealArticleById, getDealArticleTagOptions } from "@/lib/admin-store";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const article = await getDealArticleById(id);

  if (!article) {
    return { title: "文章不存在" };
  }

  return {
    title: `编辑 ${article.title}`,
  };
}

export default async function AdminEditArticlePage({ params }: PageProps) {
  const { id } = await params;
  const [article, existingTags] = await Promise.all([
    getDealArticleById(id),
    getDealArticleTagOptions(),
  ]);

  if (!article) {
    notFound();
  }

  const action = updateDealArticleAction.bind(null, article.id);

  return (
    <>
      <AdminPageHeader
        kicker="article management"
        title="编辑文章"
        description="从列表进入编辑页后，可以直接替换封面、重排原文、调整状态和标签。"
        actions={
          <div className="flex justify-start lg:justify-end">
            <Link href="/admin/articles" className={buttonVariants({ variant: "secondary", size: "lg" })}>
              <ArrowLeftIcon />
              返回列表
            </Link>
          </div>
        }
      />

      <Card className="admin-article-form-card surface-card motion-surface motion-surface--amber rounded-[10px] border-border">
        <CardHeader className="px-5 py-4">
          <CardTitle>{article.title}</CardTitle>
          <CardDescription>当前文章已经发布到前台，保存后列表页和详情页会一起刷新。</CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <AdminDealArticleForm
            action={action}
            article={article}
            existingTags={existingTags}
            submitLabel="保存修改"
            pendingLabel="保存中..."
          />
        </CardContent>
      </Card>
    </>
  );
}
