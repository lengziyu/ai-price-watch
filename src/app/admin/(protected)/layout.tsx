import { requireAdminAuth } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminAuth();

  return <AdminShell session={session}>{children}</AdminShell>;
}
