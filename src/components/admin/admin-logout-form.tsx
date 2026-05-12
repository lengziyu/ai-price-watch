import { LogOutIcon } from "lucide-react";

import { logoutAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export function AdminLogoutForm() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="secondary" size="sm">
        <LogOutIcon data-icon="inline-start" />
        退出登录
      </Button>
    </form>
  );
}
