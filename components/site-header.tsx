// components/site-header.tsx
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "./ui/mode-toggle";
import { ThemeSelector } from "./theme-selector";
import { UserNav } from "./ui/user-nav"; // Yeni kullanıcı menüsünü import et

export function SiteHeader() {
  return (
    <header className="flex h-[var(--header-height)] shrink-0 items-center gap-2 border-b px-4 lg:px-6">
      <div className="flex w-full items-center gap-2">
        {/* Bu bileşen daha önce hata verdiği için yorumda bırakıyorum.
            Eğer SidebarProvider sorunu çözüldüyse yorumu kaldırabilirsiniz.
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        /> 
        */}
        <h1 className="text-base font-medium">Documents</h1>

        {/* Header'ın sağ tarafındaki grup */}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://github.com/MrERSOY/Dashboard-with-help"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              GitHub
            </a>
          </Button>
          <ThemeSelector />
          <ModeToggle />
          <Separator orientation="vertical" className="mx-2 h-6" />

          {/* YENİ: Kullanıcı menüsü bileşeni buraya eklendi */}
          <UserNav />
        </div>
      </div>
    </header>
  );
}
