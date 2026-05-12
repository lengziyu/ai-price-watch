import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "管理后台",
  description: "雷价通内容采集、人工复核与手动录入后台。",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
