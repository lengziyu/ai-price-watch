import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { createDealArticleAction } from "@/app/admin/actions";
import { AdminDealArticleForm } from "@/components/admin/admin-deal-article-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDealArticleTagOptions } from "@/lib/admin-store";

export default async function AdminNewArticlePage() {
  const existingTags = await getDealArticleTagOptions();

  return (
    <>
      <AdminPageHeader
        kicker="article management"
        title="新增文章"
        description="先补标题、来源和原文，系统会自动重排正文、摘要、slug 和封面回退。"
        actions={
          <div className="flex justify-start lg:justify-end">
            <Link href="/admin/articles" className={buttonVariants({ variant: "secondary", size: "lg" })}>
              <ArrowLeftIcon />
              返回列表
            </Link>
          </div>
        }
      />

      <Card className="admin-article-form-card surface-card motion-surface motion-surface--green rounded-[10px] border-border">
        <CardHeader className="px-5 py-4">
          <CardTitle>文章表单</CardTitle>
          <CardDescription>支持默认封面，也支持直接上传自定义封面图。</CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <AdminDealArticleForm
            action={createDealArticleAction}
            existingTags={existingTags}
            submitLabel="发布文章"
            pendingLabel="发布中..."
          />
        </CardContent>
      </Card>
    </>
  );
}
