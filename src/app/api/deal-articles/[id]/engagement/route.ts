import { revalidatePath } from "next/cache";

import { getDealArticleSlugForLocale } from "@/lib/deal-article-localization";
import { getDealArticleById, updateDealArticleEngagement } from "@/lib/admin-store";
import { addLocalePrefix, supportedLocales } from "@/lib/i18n";

type RequestBody = {
  type?: "view" | "like";
};

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const article = await getDealArticleById(id);

  if (!article) {
    return Response.json({ error: "文章不存在。" }, { status: 404 });
  }

  let payload: RequestBody;

  try {
    payload = (await request.json()) as RequestBody;
  } catch {
    return Response.json({ error: "请求体格式不正确。" }, { status: 400 });
  }

  if (payload.type !== "view" && payload.type !== "like") {
    return Response.json({ error: "不支持的互动类型。" }, { status: 400 });
  }

  const nextArticle = await updateDealArticleEngagement(id, {
    viewIncrement: payload.type === "view" ? 1 : 0,
    likeIncrement: payload.type === "like" ? 1 : 0,
  });

  for (const locale of supportedLocales) {
    revalidatePath(addLocalePrefix("/deals", locale));
    revalidatePath(
      addLocalePrefix(`/deals/articles/${getDealArticleSlugForLocale(article, locale)}`, locale),
    );
  }

  return Response.json({
    viewCount: nextArticle.viewCount,
    likeCount: nextArticle.likeCount,
  });
}
