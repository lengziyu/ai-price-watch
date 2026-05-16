import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "管理中心",
  description: "雷价通内容采集、人工复核与录入管理中心。",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
