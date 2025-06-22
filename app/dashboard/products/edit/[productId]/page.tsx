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
import { Upload, Trash2 } from "lucide-react";
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
import { CldUploadButton } from "next-cloudinary";

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

// Form şeması
const productFormSchema = z.object({
  name: z.string().min(3, { message: "Ürün adı en az 3 karakter olmalıdır." }),
  description: z.string().optional(),
  category: z.string({ required_error: "Lütfen bir kategori seçin." }),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int(),
  barcode: z.string().min(1, { message: "Barkod alanı zorunludur." }),
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {},
  });

  // Ürün verisini çekmek ve formu doldurmak için
  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
          // Hata durumunda spesifik bir mesaj fırlat
          const errorData = await response.json();
          throw new Error(errorData.error || "Ürün bilgileri yüklenemedi.");
        }
        const productData = await response.json();
        form.reset(productData); // react-hook-form'un reset metodu ile formu doldur
        if (productData.image_url) {
          setImagePreview(productData.image_url);
        }
      } catch (error: any) {
        toast.error(error.message);
        // DÜZELTME: Hata durumunda artık otomatik yönlendirme yapmıyoruz.
        // router.push('/dashboard/products');
      } finally {
        setIsLoading(false);
      }
    }
    if (productId) fetchProduct();
  }, [productId, form, router]);

  // Cloudinary'ye resim yüklendiğinde çalışır
  const handleUploadSuccess = (result: any) => {
    const secureUrl = result?.info?.secure_url;
    if (secureUrl) {
      setImagePreview(secureUrl);
      toast.success("Resim başarıyla yüklendi!");
    } else {
      toast.error("Resim yüklenirken bir hata oluştu.");
    }
  };

  // Form gönderildiğinde çalışacak fonksiyon
  async function onSubmit(data: ProductFormData) {
    const promise = fetch(`/api/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, image_url: imagePreview }),
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
          name="image" // Form şemasında olmasa da FormItem için bir isim gerekli
          render={() => (
            <FormItem>
              <FormLabel>Ürün Görseli</FormLabel>
              <div className="mt-2 flex items-center gap-4">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Önizleme"
                    className="w-24 h-24 rounded-lg object-cover border"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                    Görsel Yok
                  </div>
                )}
                <CldUploadButton
                  options={{ maxFiles: 1 }}
                  onSuccess={handleUploadSuccess}
                  uploadPreset="ml_default"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  <Upload className="mr-2 h-4 w-4" /> Görsel Yükle/Değiştir
                </CldUploadButton>
              </div>
              <FormDescription>
                Yeni bir görsel yüklediğinizde, kaydetmeden önce burada görünür.
              </FormDescription>
            </FormItem>
          )}
        />

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

        {/* DÜZELTME: Eksik olan form alanları geri eklendi */}
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
                      <SelectValue placeholder="Bir kategori seçin" />
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
