import Image from "next/image";
import Link from "next/link";
import { PlusIcon, SquareArrowOutUpRightIcon } from "lucide-react";

import { AdminDeleteArticleForm } from "@/components/admin/admin-delete-article-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDealArticleSourcePlatform, formatDealArticleStatus } from "@/lib/deal-articles";
import { getDealArticles } from "@/lib/admin-store";
import { formatDate } from "@/lib/format";

export default async function AdminArticlesPage() {
  const articles = await getDealArticles();

  return (
    <>
      <AdminPageHeader
        kicker="article management"
        title="文章管理"
        description="文章发布独立成后台模块。先看列表，再决定新增、编辑、删除或跳到前台查看。"
        actions={
          <div className="flex justify-start lg:justify-end">
            <Link
              href="/admin/articles/new"
              className={buttonVariants({ size: "lg", className: "px-5" })}
            >
              <PlusIcon />
              新增文章
            </Link>
          </div>
        }
      />

      <Card className="surface-card motion-surface motion-surface--blue rounded-[10px] border-border">
        <CardHeader className="px-5 py-4">
          <CardTitle>文章列表</CardTitle>
          <CardDescription>默认按发布时间倒序排列，封面、状态、来源和摘要都放在同一张表里。</CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {articles.length ? (
            <div className="overflow-hidden rounded-[10px] border border-border bg-background/68">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[132px]">封面</TableHead>
                    <TableHead>标题</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>来源</TableHead>
                    <TableHead>发布时间</TableHead>
                    <TableHead>更新时间</TableHead>
                    <TableHead className="min-w-[280px]">摘要</TableHead>
                    <TableHead className="w-[240px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => (
                    <TableRow key={article.id} className="hover:bg-primary/[0.045]">
                      <TableCell>
                        <div className="relative aspect-[16/9] w-[112px] overflow-hidden rounded-[10px] border border-border bg-background/72">
                          <Image
                            src={article.coverImageUrl}
                            alt={`${article.title} 封面`}
                            fill
                            className="object-cover"
                            sizes="112px"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[260px] whitespace-normal">
                        <div className="font-medium text-foreground">{article.title}</div>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {article.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={`${tag}-${index}`} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{formatDealArticleStatus(article.status)}</Badge>
                      </TableCell>
                      <TableCell>{formatDealArticleSourcePlatform(article.sourcePlatform)}</TableCell>
                      <TableCell>{formatDate(article.publishedAt)}</TableCell>
                      <TableCell>{formatDate(article.updatedAt)}</TableCell>
                      <TableCell className="max-w-[360px] whitespace-normal text-muted-foreground">
                        {article.summary}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1">
                          <Link
                            href={`/deals/articles/${article.slug}`}
                            target="_blank"
                            className={buttonVariants({ variant: "ghost", size: "sm", className: "text-primary hover:text-primary" })}
                          >
                            前台
                            <SquareArrowOutUpRightIcon className="size-3.5" />
                          </Link>
                          <Link
                            href={`/admin/articles/${article.id}/edit`}
                            className={buttonVariants({ variant: "ghost", size: "sm", className: "text-primary hover:text-primary" })}
                          >
                            编辑
                          </Link>
                          <AdminDeleteArticleForm articleId={article.id} articleTitle={article.title} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="admin-pane text-sm text-muted-foreground">
              还没有文章。先新建一篇，把 X 或 Linux.do 的原文贴进来。
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
