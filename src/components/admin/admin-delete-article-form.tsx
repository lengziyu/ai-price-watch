"use client";

import { useFormStatus } from "react-dom";

import { deleteDealArticleAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="ghost" size="sm" disabled={pending} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
      {pending ? "删除中..." : "删除"}
    </Button>
  );
}

export function AdminDeleteArticleForm({
  articleId,
  articleTitle,
}: {
  articleId: string;
  articleTitle: string;
}) {
  const action = deleteDealArticleAction.bind(null, articleId);

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(`确定删除「${articleTitle}」吗？`)) {
          event.preventDefault();
        }
      }}
    >
      <DeleteButton />
    </form>
  );
}
