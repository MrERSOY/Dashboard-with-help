// components/ui/user-nav.tsx
"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserNav() {
  // useSession hook'u ile mevcut oturum bilgilerini ve durumunu alıyoruz
  const { data: session, status } = useSession();

  // Oturum bilgisi yüklenirken bir "iskelet" (loading skeleton) göster
  if (status === "loading") {
    return (
      <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
    );
  }

  // Eğer kullanıcı giriş yapmışsa (authenticated), profil menüsünü göster
  if (status === "authenticated" && session?.user) {
    // Avatar için fallback baş harfleri oluştur (örn: Çağatay Ersoy -> ÇE)
    const fallbackInitials = session.user.name
      ? session.user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
      : session.user.email?.[0].toUpperCase();

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={session.user.image ?? ""} // Kullanıcının resmi varsa gösterilir
                alt={session.user.name ?? "Kullanıcı Avatarı"}
              />
              <AvatarFallback>{fallbackInitials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {session.user.name ?? "Kullanıcı Adı"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {session.user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">Ayarlar</Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
            Çıkış Yap
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Eğer kullanıcı giriş yapmamışsa (unauthenticated), giriş yap butonunu göster
  return (
    <Link href="/login">
      <Button variant="outline">Giriş Yap</Button>
    </Link>
  );
}
