// app/dashboard/users/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { toast, Toaster } from "sonner";
import { UserRole } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// Veritabanından gelen kullanıcı tipi
interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  image: string | null;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<UserRole | "">("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Veritabanından kullanıcıları çek
  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/users");
        if (!response.ok) throw new Error("Kullanıcılar yüklenemedi.");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu."
        );
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const handleOpenModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
  };

  const handleCloseModal = () => {
    if (isUpdating) return;
    setSelectedUser(null);
    setNewRole("");
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;
    setIsUpdating(true);
    const promise = fetch(`/api/users/${selectedUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Rol güncellenemedi.");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: "Rol güncelleniyor...",
      success: (updatedUser: User) => {
        setUsers((currentUsers) =>
          currentUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u))
        );
        handleCloseModal();
        return `${
          updatedUser.name || "Kullanıcının"
        } rolü başarıyla güncellendi.`;
      },
      error: (err: Error) => err.message,
      finally: () => setIsUpdating(false),
    });
  };

  const loggedInUser = session?.user;
  const isAdmin = loggedInUser?.role === "ADMIN";

  const roleLabels: Record<UserRole, string> = {
    ADMIN: "Yönetici",
    STAFF: "Personel",
    CUSTOMER: "Müşteri",
  };

  const roleColors: Record<UserRole, string> = {
    ADMIN: "bg-red-100 text-red-800 border-red-200",
    STAFF: "bg-blue-100 text-blue-800 border-blue-200",
    CUSTOMER: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <>
      <Toaster richColors position="top-right" />
      <div>
        <h1 className="text-3xl font-bold mb-2">Kullanıcı Yönetimi</h1>
        <p className="text-muted-foreground mb-8">
          Ekip üyelerini görüntüleyin ve rollerini düzenleyin.
        </p>

        <div className="bg-card rounded-lg shadow-md border overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {users.map((user) => (
                <li
                  key={user.id}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <Image
                      // DÜZELTME: Profil fotoğrafı veya isim null (boş) olsa bile
                      // hata vermeyecek daha güvenli bir yapı kullanıldı.
                      src={
                        user.image ||
                        `https://placehold.co/40x40/e2e8f0/94a3b8?text=${(
                          user.name || "U"
                        )
                          .charAt(0)
                          .toUpperCase()}`
                      }
                      alt={user.name || "Kullanıcı Avatarı"}
                      width={40}
                      height={40}
                      className="rounded-full bg-muted"
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {user.name || "İsimsiz Kullanıcı"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.email || "E-posta yok"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                    <Badge variant="outline" className={roleColors[user.role]}>
                      {roleLabels[user.role]}
                    </Badge>
                    {isAdmin && loggedInUser?.id !== user.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModal(user)}
                      >
                        Rolü Düzenle
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Dialog open={!!selectedUser} onOpenChange={handleCloseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.name || "Kullanıcının"} rolünü düzenle
            </DialogTitle>
            <DialogDescription>
              Bu kullanıcıya yeni bir rol atayarak yetkilerini
              değiştirebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select
              value={newRole || ""}
              onValueChange={(value) => setNewRole(value as UserRole)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Bir rol seçin" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(UserRole).map((role) => (
                  <SelectItem key={role} value={role}>
                    {roleLabels[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseModal}
              disabled={isUpdating}
            >
              İptal
            </Button>
            <Button onClick={handleRoleChange} disabled={isUpdating}>
              {isUpdating ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
