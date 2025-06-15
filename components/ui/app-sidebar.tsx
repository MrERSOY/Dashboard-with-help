// components/ui/app-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // cn utility'niz olduğunu varsayarak
import {
  LayoutDashboard,
  PlusCircle,
  Recycle,
  BarChart3,
  FolderKanban,
  Users2,
  Library,
  FileText,
  MessageCircleQuestion,
  MoreHorizontal,
  Mail,
} from "lucide-react";

const mainNavLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/lifecycle", label: "Stok Takibi", icon: Recycle },
  { href: "/dashboard/analytics", label: "Analitik", icon: BarChart3 },
  { href: "/dashboard/products", label: "Ürün Yönetimi", icon: FolderKanban },
  { href: "/dashboard/team", label: "Kullanıcılar", icon: Users2 },
];

const documentsNavLinks = [
  { href: "/dashboard/data-library", label: "Veri Kütüphanesi", icon: Library },
  { href: "/dashboard/reports", label: "Raporlar", icon: FileText },
  {
    href: "/dashboard/complaints",
    label: "Şikayetler",
    icon: MessageCircleQuestion,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-col bg-gray-900 text-gray-300 p-4 space-y-4 hidden md:flex">
      {/* Logo / Şirket Adı */}
      <div className="px-2 py-1 text-white text-xl font-bold">Acme Inc.</div>

      {/* Quick Create */}
      <div className="px-2">
        <Link href="/dashboard/quick-create">
          <button className="w-full flex items-center justify-between p-2 rounded-lg text-sm font-semibold bg-gray-700 hover:bg-gray-600 text-white transition-colors">
            <div className="flex items-center gap-2">
              <PlusCircle size={16} />
              Quick Create
            </div>
            <Mail size={16} />
          </button>
        </Link>
      </div>

      {/* Ana Navigasyon */}
      <nav className="flex-1 space-y-1">
        {mainNavLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white hover:bg-gray-700",
              {
                "bg-gray-700 text-white":
                  pathname === link.href ||
                  (link.href !== "/dashboard" &&
                    pathname.startsWith(link.href)),
              }
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Dokümanlar Bölümü */}
      <div className="space-y-1">
        <h2 className="px-3 text-xs font-semibold uppercase text-gray-500">
          Documents
        </h2>
        {documentsNavLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white hover:bg-gray-700",
              { "bg-gray-700 text-white": pathname.startsWith(link.href) }
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}

        <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white hover:bg-gray-700 w-full">
          <MoreHorizontal className="h-4 w-4" />
          More
        </button>
      </div>
    </aside>
  );
}
