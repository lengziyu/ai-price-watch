"use client";

import { useActionState, useState } from "react";

import { loginAction, type LoginActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: LoginActionState = {};

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [username, setUsername] = useState("admin");

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <label htmlFor="username" className="text-sm font-medium text-foreground">
          用户名
        </label>
        <Input
          id="username"
          name="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="admin"
          autoComplete="username"
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          密码
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="请输入管理员密码"
          autoComplete="current-password"
        />
      </div>

      {state.error ? (
        <div className="rounded-[12px] border border-destructive/25 bg-destructive/8 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      ) : null}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "登录中..." : "登录管理中心"}
      </Button>
    </form>
  );
}
