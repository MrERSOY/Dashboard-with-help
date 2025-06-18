// app/dashboard/products/new/page.tsx
"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Toaster, toast } from "sonner";
import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Camera, X, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { BarcodeScanner } from "@/components/ui/barcode-scanner";

// Zod ile form şeması (API ile aynı olmalı)
const productFormSchema = z.object({
  name: z.string().min(3, { message: "Ürün adı en az 3 karakter olmalıdır." }),
  description: z.string().optional(),
  category: z.string({ required_error: "Lütfen bir kategori seçin." }),
  price: z.coerce
    .number({ invalid_type_error: "Lütfen geçerli bir fiyat girin." })
    .min(0),
  stock: z.coerce
    .number({ invalid_type_error: "Lütfen geçerli bir stok girin." })
    .int(),
  barcode: z.string().min(1, { message: "Barkod alanı zorunludur." }),
});

type ProductFormData = z.infer<typeof productFormSchema>;

function NewProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const barcodeFromUrl = searchParams.get("barcode");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      category: "Elektronik",
      barcode: barcodeFromUrl || "",
    },
  });

  useEffect(() => {
    if (barcodeFromUrl) {
      setValue("barcode", barcodeFromUrl, { shouldValidate: true });
    }
  }, [barcodeFromUrl, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    const promise = new Promise(async (resolve, reject) => {
      try {
        let imageUrl: string | null = null;

        if (imageFile) {
          const filePath = `public/${Date.now()}_${imageFile.name}`;
          const { error: uploadError } = await supabase.storage
            .from("product_images")
            .upload(filePath, imageFile);

          if (uploadError) {
            throw new Error("Resim yüklenemedi: " + uploadError.message);
          }

          const { data: urlData } = supabase.storage
            .from("product_images")
            .getPublicUrl(filePath);
          imageUrl = urlData.publicUrl;
        }

        const response = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, image_url: imageUrl }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Ürün oluşturulamadı.");
        }

        const newProduct = await response.json();
        resolve(newProduct);
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(promise, {
      loading: "Ürün kaydediliyor...",
      success: (product: any) => {
        router.push("/dashboard/products");
        return `'${product.name}' ürünü başarıyla eklendi!`;
      },
      error: (err: any) => err.message,
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Görsel Yükleme Alanı */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ürün Görseli
          </label>
          <div className="flex items-center gap-4">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Ürün Önizleme"
                className="w-24 h-24 rounded-lg object-cover border"
              />
            ) : (
              <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 text-sm p-2 text-center">
                Görsel Yok
              </div>
            )}
            <div>
              <label
                htmlFor="image-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="mr-2 h-4 w-4" />
                Görsel Seç
              </label>
              <input
                id="image-upload"
                name="image-upload"
                type="file"
                className="sr-only"
                onChange={handleImageChange}
                accept="image/*"
              />
              <p className="text-xs text-gray-500 mt-2">
                PNG, JPG, GIF (MAX. 2MB)
              </p>
            </div>
          </div>
        </div>

        {/* Diğer Form Alanları */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Ürün Adı
          </label>
          <Input id="name" {...register("name")} />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="barcode"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Barkod
          </label>
          <Input id="barcode" {...register("barcode")} />
          {errors.barcode && (
            <p className="text-sm text-red-500 mt-1">
              {errors.barcode.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Kategori
            </label>
            <select
              id="category"
              {...register("category")}
              className="block w-full h-10 px-3 border border-input rounded-md"
            >
              <option>Elektronik</option> <option>Aksesuar</option>{" "}
              <option>Giyim</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fiyat (₺)
            </label>
            <Input
              id="price"
              type="number"
              step="0.01"
              {...register("price")}
            />
            {errors.price && (
              <p className="text-sm text-red-500 mt-1">
                {errors.price.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="stock"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Stok Adedi
            </label>
            <Input id="stock" type="number" step="1" {...register("stock")} />
            {errors.stock && (
              <p className="text-sm text-red-500 mt-1">
                {errors.stock.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Ürün Açıklaması
          </label>
          <Textarea id="description" {...register("description")} />
        </div>

        <div className="mt-8 pt-5 border-t flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Kaydediliyor..." : "Ürünü Kaydet"}
          </Button>
        </div>
      </form>
    </>
  );
}

export default function NewProductPage() {
  return (
    <div>
      <Toaster richColors position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Yeni Ürün Ekle</h2>
        <Link href="/dashboard/products">
          <Button variant="outline">&larr; Geri Dön</Button>
        </Link>
      </div>
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
        <Suspense fallback={<div>Form yükleniyor...</div>}>
          <NewProductForm />
        </Suspense>
      </div>
    </div>
  );
}
