// app/dashboard/products/edit/[productId]/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Toaster, toast } from "sonner";
import { supabase } from "@/lib/supabase";

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

const productFormSchema = z.object({
  name: z.string().min(3, { message: "Ürün adı en az 3 karakter olmalıdır." }),
  description: z.string().optional(),
  category: z.string(),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  barcode: z.string().min(1),
  // image_url formdan doğrudan gelmez, ayrıca işlenir.
});

type ProductFormData = z.infer<typeof productFormSchema>;

function EditProductForm() {
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
  });

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error || !data) {
        toast.error("Ürün bilgileri yüklenemedi.");
        router.push("/dashboard/products");
        return;
      }

      reset(data); // Formu veritabanından gelen verilerle doldur
      if (data.image_url) {
        setImagePreview(data.image_url);
      }
    }
    if (productId) fetchProduct();
  }, [productId, reset, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    const promise = new Promise(async (resolve, reject) => {
      let finalImageUrl = imagePreview;

      // 1. Yeni resim varsa, önce onu yükle
      if (imageFile) {
        const filePath = `public/${Date.now()}_${imageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("product_images") // Supabase'deki bucket adınız
          .upload(filePath, imageFile);

        if (uploadError) {
          return reject(new Error("Resim yüklenemedi: " + uploadError.message));
        }

        const { data: urlData } = supabase.storage
          .from("product_images")
          .getPublicUrl(filePath);
        finalImageUrl = urlData.publicUrl;
      }

      // 2. Ürün bilgilerini API'ye göndererek güncelle
      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, image_url: finalImageUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return reject(new Error(errorData.error || "Ürün güncellenemedi."));
      }

      const updatedProduct = await response.json();
      resolve(updatedProduct);
    });

    toast.promise(promise, {
      loading: "Ürün güncelleniyor...",
      success: (product: any) => {
        router.push("/dashboard/products");
        return `'${product.name}' ürünü başarıyla güncellendi!`;
      },
      error: (err: any) => err.message,
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const promise = fetch(`/api/products/${productId}`, { method: "DELETE" });

    toast.promise(promise, {
      loading: "Ürün siliniyor...",
      success: () => {
        router.push("/dashboard/products");
        return "Ürün başarıyla silindi.";
      },
      error: "Ürün silinirken bir hata oluştu.",
    });
    setIsDeleting(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Görsel Alanı */}
      <div className="flex items-center gap-4">
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Önizleme"
            className="w-24 h-24 rounded-lg object-cover border"
          />
        ) : (
          <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">
            Görsel Yok
          </div>
        )}
        <div>
          <label
            htmlFor="image-upload"
            className="cursor-pointer inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="mr-2 h-4 w-4" /> Değiştir
          </label>
          <input
            id="image-upload"
            type="file"
            className="sr-only"
            onChange={handleImageChange}
            accept="image/*"
          />
        </div>
      </div>

      {/* Form Alanları */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Ürün Adı
        </label>
        <Input id="name" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="barcode" className="block text-sm font-medium">
          Barkod
        </label>
        <Input id="barcode" {...register("barcode")} />
        {errors.barcode && (
          <p className="text-sm text-red-500 mt-1">{errors.barcode.message}</p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium">
            Kategori
          </label>
          <Input id="category" {...register("category")} />
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium">
            Fiyat (₺)
          </label>
          <Input id="price" type="number" step="0.01" {...register("price")} />
        </div>
        <div>
          <label htmlFor="stock" className="block text-sm font-medium">
            Stok Adedi
          </label>
          <Input id="stock" type="number" step="1" {...register("stock")} />
        </div>
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Açıklama
        </label>
        <Textarea id="description" {...register("description")} />
      </div>

      <div className="flex justify-between items-center mt-8 pt-5 border-t">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive" disabled={isDeleting}>
              <Trash2 className="mr-2 h-4 w-4" />
              Bu Ürünü Sil
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
              <AlertDialogDescription>
                Bu işlem geri alınamaz. Bu ürün kalıcı olarak silinecektir.
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default function EditProductPage() {
  return (
    <div>
      <Toaster richColors position="top-right" />
      <h2 className="text-2xl font-semibold mb-6">Ürünü Düzenle</h2>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <Suspense fallback={<div>Form yükleniyor...</div>}>
          <EditProductForm />
        </Suspense>
      </div>
    </div>
  );
}
