// components/app-sidebar.tsx veya components/ui/app-sidebar.tsx gibi bir yolda olabilir
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // Projenizdeki `cn` utility fonksiyonu
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
  Settings,
  HelpCircle,
  Search,
  Bell,
} from "lucide-react";

// Ana navigasyon linkleri
const mainNavLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/lifecycle", label: "Stok Takibi", icon: Recycle },
  { href: "/dashboard/analytics", label: "Analitik", icon: BarChart3 },
  { href: "/dashboard/products", label: "Ürün Yönetimi", icon: FolderKanban },
  { href: "/dashboard/team", label: "Kullanıcılar", icon: Users2 },
];

// İkincil navigasyon linkleri
const secondaryNavLinks = [
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
    <aside className="w-64 flex-col bg-gray-900 text-gray-300 p-4 space-y-2 hidden md:flex">
      {/* Logo / Şirket Adı */}
      <div className="px-2 py-2 text-white text-xl font-bold flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-white"></div>
        Acme Inc.
      </div>

      {/* Quick Create */}
      <div className="px-2">
        <Link href="/dashboard/quick-create">
          <button className="w-full flex items-center justify-between p-2 rounded-lg text-sm font-semibold bg-gray-800 hover:bg-gray-700 text-white transition-colors border border-gray-700">
            <div className="flex items-center gap-2">
              <PlusCircle size={16} />
              Quick Create
            </div>
            <Mail size={16} />
          </button>
        </Link>
      </div>

      {/* Ana Navigasyon */}
      <nav className="flex-1 mt-2 space-y-1">
        {mainNavLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-800",
              {
                "bg-gray-800 text-white":
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
        <h2 className="px-3 text-xs font-semibold uppercase text-gray-500 tracking-wider">
          Documents
        </h2>
        {secondaryNavLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-800",
              { "bg-gray-800 text-white": pathname.startsWith(link.href) }
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}

        <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-800 w-full">
          <MoreHorizontal className="h-4 w-4" />
          More
        </button>
      </div>

      {/* Alt Bölüm */}
      <div className="mt-auto pt-4 border-t border-gray-800 space-y-1">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-800"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <Link
          href="/dashboard/help"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-800"
        >
          <HelpCircle className="h-4 w-4" />
          Get Help
        </Link>
        <div className="relative px-3">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-gray-800 border-gray-700 border rounded-md pl-8 pr-3 py-1.5 text-sm"
          />
        </div>
        <div className="px-3 flex items-center justify-between text-red-500">
          <span className="flex items-center gap-2 text-sm">
            <Bell className="h-4 w-4" /> 2 Issues
          </span>
          <div className="h-2 w-2 rounded-full bg-red-500"></div>
        </div>
      </div>
    </aside>
  );
}
