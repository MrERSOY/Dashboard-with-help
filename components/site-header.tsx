// components/site-header.tsx
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "./ui/user-nav";
import { ThemeSelector } from "./theme-selector";
import { ModeToggle } from "./ui/mode-toggle";
import { Button } from "./ui/button";

export function SiteHeader() {
  return (
    <header className="flex h-[var(--header-height)] shrink-0 items-center gap-2 border-b px-4 lg:px-6">
      <div className="flex w-full items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">Documents</h1>
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
          <UserNav />
        </div>
      </div>
    </header>
  );
}
