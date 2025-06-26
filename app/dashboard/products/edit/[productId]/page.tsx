// app/dashboard/products/edit/[productId]/page.tsx
"use client";

import { useEffect, useState, Suspense, useTransition } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Toaster, toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

// Kapsamlı kategori listesi
const allCategories = [
  "Elektronik",
  "Giyim & Moda",
  "Ev, Yaşam & Bahçe",
  "Kozmetik & Kişisel Bakım",
  "Anne & Bebek",
  "Kitap, Müzik & Film",
  "Spor & Outdoor",
  "Oyuncak & Hobi",
  "Gıda",
  "Otomotiv & Motosiklet",
  "Yapı Market",
];

// Form şeması güncellendi: image_url eklendi
const productFormSchema = z.object({
  name: z.string().min(3, { message: "Ürün adı en az 3 karakter olmalıdır." }),
  description: z.string().optional(),
  category: z.string({ required_error: "Lütfen bir kategori seçin." }),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int(),
  barcode: z.string().min(1, { message: "Barkod alanı zorunludur." }),
  image_url: z
    .string()
    .url({ message: "Lütfen geçerli bir URL girin." })
    .optional()
    .or(z.literal("")),
});

type ProductFormData = z.infer<typeof productFormSchema>;

// Formun mantığını ve arayüzünü içeren asıl bileşen
function EditProductForm() {
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
  });

  // Ürün verisini çekmek ve formu doldurmak için
  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Ürün bilgileri yüklenemedi.");
        }
        const productData = await response.json();
        form.reset(productData);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    if (productId) fetchProduct();
  }, [productId, form, router]);

  // Form gönderildiğinde çalışacak fonksiyon
  async function onSubmit(data: ProductFormData) {
    const promise = fetch(`/api/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data), // Resim URL'i artık form verisinin bir parçası
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ürün güncellenemedi.");
      }
      return response.json();
    });

    toast.promise(promise, {
      loading: "Değişiklikler kaydediliyor...",
      success: (res) => {
        startTransition(() => {
          router.push("/dashboard/products");
          router.refresh();
        });
        return `Ürün başarıyla güncellendi!`;
      },
      error: (err: any) => err.message,
    });
  }

  // Ürünü silme fonksiyonu
  const handleDelete = async () => {
    setIsDeleting(true);
    const promise = fetch(`/api/products/${productId}`, { method: "DELETE" });

    toast.promise(promise, {
      loading: "Ürün siliniyor...",
      success: () => {
        startTransition(() => {
          router.push("/dashboard/products");
          router.refresh();
        });
        return "Ürün başarıyla silindi.";
      },
      error: "Ürün silinirken bir hata oluştu.",
      finally: () => setIsDeleting(false),
    });
  };

  if (isLoading) {
    return <div className="text-center p-8">Ürün bilgileri yükleniyor...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ürün Adı</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* YENİ: Resim URL'i için metin kutusu */}
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resim URL'i</FormLabel>
              <div className="flex items-start gap-4">
                <Image
                  src={
                    field.value ||
                    "https://placehold.co/100x100/e2e8f0/94a3b8?text=G%C3%B6rsel"
                  }
                  alt="Ürün Görseli"
                  width={100}
                  height={100}
                  className="rounded-lg border object-cover"
                />
                <div className="w-full">
                  <FormControl>
                    <Input placeholder="https://i.ibb.co/..." {...field} />
                  </FormControl>
                  <FormDescription className="mt-2">
                    Resmi [imgbb.com](https://imgbb.com/) gibi bir siteye
                    yükleyip "Direct link"i buraya yapıştırın.
                  </FormDescription>
                  <FormMessage />
                </div>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="barcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Barkod</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value ?? ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {allCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fiyat (₺)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stok Adedi</FormLabel>
                <FormControl>
                  <Input type="number" step="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ürün Açıklaması</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ürünün özelliklerini ve detaylarını buraya yazın..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between items-center mt-8 pt-5 border-t">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" disabled={isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" /> Bu Ürünü Sil
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu işlem geri alınamaz.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Evet, Sil
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/products")}
            >
              İptal
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? "Kaydediliyor..."
                : "Değişiklikleri Kaydet"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

// Ana sayfa bileşeni
export default function EditProductPage() {
  return (
    <div>
      <Toaster richColors position="top-right" />
      <h2 className="text-2xl font-semibold mb-6">Ürünü Düzenle</h2>
      <div className="bg-card p-8 rounded-lg shadow-md border">
        <Suspense fallback={<div>Form yükleniyor...</div>}>
          <EditProductForm />
        </Suspense>
      </div>
    </div>
  );
}
