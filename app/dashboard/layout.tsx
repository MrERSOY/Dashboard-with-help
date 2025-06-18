// app/dashboard/layout.tsx
import { DashboardClientLayout } from "@/components/dashboard-client-layout";

// Bu dosya artık bir Sunucu Bileşeni.
// Tek görevi, istemci tarafı layout'unu çağırmak.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
