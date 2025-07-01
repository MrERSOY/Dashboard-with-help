// components/app-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  Boxes, // YENİ: Stok Yönetimi için daha uygun bir ikon
  BarChart3,
  FolderKanban,
  Users2,
  FileText,
  MessageCircleQuestion,
  Settings,
  ShoppingCart, // YENİ: POS için ikon
} from "lucide-react";

interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

const mainNavLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/pos", label: "Hızlı Satış (POS)", icon: ShoppingCart },
  { href: "/dashboard/orders", label: "Siparişler", icon: FileText },
  { href: "/dashboard/products", label: "Ürünler", icon: FolderKanban },
  // GÜNCELLENDİ: "Stok Takibi" linki, yeni "Stok Yönetimi" sayfasıyla değiştirildi.
  { href: "/dashboard/inventory", label: "Stok Yönetimi", icon: Boxes },
  { href: "/dashboard/users", label: "Kullanıcılar", icon: Users2 },
  { href: "/dashboard/analytics", label: "Analitik", icon: BarChart3 },
];

const secondaryNavLinks: NavLink[] = [
  { href: "/dashboard/reports", label: "Raporlar", icon: FileText },
  {
    href: "/dashboard/complaints",
    label: "Şikayetler",
    icon: MessageCircleQuestion,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const renderLink = (link: NavLink, isTooltip: boolean) => {
    const isActive =
      pathname === link.href ||
      (link.href !== "/dashboard" && pathname.startsWith(link.href));
    const linkContent = (
      <Link
        href={link.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-800",
          { "bg-gray-800 text-white": isActive },
          isTooltip && "justify-center"
        )}
      >
        <link.icon className="h-4 w-4" />
        <span className={cn(isTooltip && "sr-only")}>{link.label}</span>
      </Link>
    );

    if (isTooltip) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={5}>
            {link.label}
          </TooltipContent>
        </Tooltip>
      );
    }
    return linkContent;
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex-col bg-gray-900 text-gray-300 p-4 space-y-2 hidden md:flex transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="px-2 py-2 text-white text-xl font-bold flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white flex-shrink-0"></div>
          <span className={cn(isCollapsed && "sr-only")}>Acme Inc.</span>
        </div>

        <nav className="flex-1 mt-2 space-y-1">
          {mainNavLinks.map((link) => (
            <div key={link.href}>{renderLink(link, isCollapsed)}</div>
          ))}
        </nav>

        <div className="space-y-1">
          <h2
            className={cn(
              "px-3 text-xs font-semibold uppercase text-gray-500 tracking-wider",
              isCollapsed && "text-center"
            )}
          >
            {isCollapsed ? "D" : "Documents"}
          </h2>
          {secondaryNavLinks.map((link) => (
            <div key={link.href}>{renderLink(link, isCollapsed)}</div>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-800 space-y-1">
          {renderLink(
            { href: "/dashboard/settings", label: "Settings", icon: Settings },
            isCollapsed
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
