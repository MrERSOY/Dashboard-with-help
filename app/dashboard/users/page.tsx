// app/dashboard/team/page.tsx
"use client"; // State yönetimi (arama, sayfalama) için Client Component

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { MailPlus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Veritabanından gelen kullanıcı tipi
interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  status: string | null;
  image?: string | null; // Prisma şemasındaki 'image' alanı
}

export default function TeamPage() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Prisma tabanlı API'den kullanıcıları çekmek için useEffect
  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/users");
        if (!response.ok) throw new Error("API'den kullanıcılar çekilemedi");

        const usersData = await response.json();
        setAllUsers(usersData || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Kullanıcılar yüklenirken bir hata oluştu."
        );
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // Arama ve sayfalama mantığı
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return allUsers;
    return allUsers.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allUsers, searchTerm]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="İsim veya e-posta ara..."
              className="pl-9 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <Button className="whitespace-nowrap w-full sm:w-auto">
            <MailPlus size={18} className="mr-2" />
            Yeni Kullanıcı Davet Et
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground mb-8">
        Ekip üyelerini görüntüleyin, rollerini ve izinlerini yönetin.
      </p>

      <div className="bg-card rounded-lg shadow-md border overflow-hidden">
        {isLoading ? (
          <p className="text-center p-8 text-muted-foreground">
            Kullanıcılar yükleniyor...
          </p>
        ) : error ? (
          <p className="text-center p-8 text-destructive">{error}</p>
        ) : paginatedUsers.length > 0 ? (
          <>
            <ul className="divide-y divide-border">
              {paginatedUsers.map((member) => (
                <li
                  key={member.id}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <Image
                      src={
                        member.image ||
                        `/images/avatars/avatar-${
                          (parseInt(member.id.slice(-1), 16) % 5) + 1
                        }.png`
                      }
                      alt={member.name || "Avatar"}
                      width={40}
                      height={40}
                      className="rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/images/avatars/default.png";
                      }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {member.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                    <p className="text-sm text-muted-foreground w-20 text-center capitalize">
                      {member.role}
                    </p>
                    <span
                      className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {member.status}
                    </span>
                    <Button variant="ghost" size="sm">
                      Düzenle
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            {/* Sayfalama Kontrolleri */}
            <div className="flex items-center justify-center p-4 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />{" "}
                </Button>
                <span className="text-sm text-muted-foreground">
                  Sayfa {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <p className="text-center p-8 text-muted-foreground">
            Veritabanında hiç kullanıcı bulunamadı.
          </p>
        )}
      </div>
    </div>
  );
}
