// app/dashboard/categories/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { Category } from "@prisma/client";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  PlusCircle,
  Trash2,
  Edit,
  Save,
  X as XIcon,
} from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [editingCategoryName, setEditingCategoryName] = useState("");

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Kategoriler yüklenemedi.");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim().length < 2) {
      toast.error("Kategori adı en az 2 karakter olmalıdır.");
      return;
    }
    setIsSubmitting(true);
    const promise = fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategoryName.trim() }),
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "Kategori oluşturulamadı.");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: "Kategori oluşturuluyor...",
      success: (newCategory: Category) => {
        setCategories((prev) =>
          [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name))
        );
        setNewCategoryName("");
        return "Kategori başarıyla oluşturuldu!";
      },
      error: (err: Error) => err.message,
      finally: () => setIsSubmitting(false),
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    const promise = fetch(`/api/categories/${categoryId}`, {
      method: "DELETE",
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "Kategori silinemedi.");
      }
    });

    toast.promise(promise, {
      loading: "Kategori siliniyor...",
      success: () => {
        setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
        return "Kategori başarıyla silindi.";
      },
      error: (err: Error) => err.message,
    });
  };

  const handleEditClick = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const handleSaveEdit = (categoryId: string) => {
    if (editingCategoryName.trim().length < 2) {
      toast.error("Kategori adı en az 2 karakter olmalıdır.");
      return;
    }
    const promise = fetch(`/api/categories/${categoryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingCategoryName.trim() }),
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "Kategori güncellenemedi.");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: "Güncelleniyor...",
      success: (updatedCategory: Category) => {
        setCategories((prev) =>
          prev.map((cat) => (cat.id === categoryId ? updatedCategory : cat))
        );
        setEditingCategoryId(null);
        return "Kategori güncellendi.";
      },
      error: (err: Error) => err.message,
    });
  };

  return (
    <>
      <Toaster richColors position="top-right" />
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Yeni Kategori Ekle</CardTitle>
              <CardDescription>
                Ürünlerinizi gruplamak için yeni bir kategori oluşturun.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <Input
                  placeholder="Örn: Elektronik"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  disabled={isSubmitting}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PlusCircle className="mr-2 h-4 w-4" />
                  )}
                  {isSubmitting ? "Ekleniyor..." : "Ekle"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Mevcut Kategoriler</CardTitle>
              <CardDescription>
                Var olan kategorileri buradan düzenleyebilir veya
                silebilirsiniz.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : categories.length > 0 ? (
                <Table>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">
                          {editingCategoryId === category.id ? (
                            <Input
                              value={editingCategoryName}
                              onChange={(e) =>
                                setEditingCategoryName(e.target.value)
                              }
                              className="h-8"
                            />
                          ) : (
                            category.name
                          )}
                        </TableCell>
                        <TableCell className="text-right w-32">
                          {editingCategoryId === category.id ? (
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleSaveEdit(category.id)}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() => setEditingCategoryId(null)}
                              >
                                <XIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEditClick(category)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Emin misiniz?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bu işlem geri alınamaz. &quot;
                                      {category.name}&quot; kategorisi kalıcı
                                      olarak silinecektir.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>İptal</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteCategory(category.id)
                                      }
                                    >
                                      Evet, Sil
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-10">
                  Henüz hiç kategori oluşturulmamış.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
