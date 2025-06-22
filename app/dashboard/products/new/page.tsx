// app/dashboard/products/new/page.tsx
"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Toaster, toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Form şeması (API ile aynı)
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
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      category: "Elektronik",
      barcode: "",
      name: "",
      description: "",
      price: 0,
      stock: 0,
    },
  });

  async function onSubmit(data: ProductFormData) {
    const promise = fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, image_url: null }), // Şimdilik resim olmadan gönderiyoruz
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ürün oluşturulamadı.");
      }
      return response.json();
    });

    toast.promise(promise, {
      loading: "Ürün kaydediliyor...",
      success: (result: any) => {
        router.push("/dashboard/products");
        return `Ürün başarıyla eklendi!`;
      },
      error: (err: any) => err.message,
    });
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
                <Input placeholder="Örn: Akıllı Telefon X1 Pro" {...field} />
              </FormControl>
              <FormMessage />
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
                <Input placeholder="Ürün barkodunu girin" {...field} />
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
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Elektronik">Elektronik</SelectItem>
                    <SelectItem value="Giyim & Moda">Giyim & Moda</SelectItem>
                    <SelectItem value="Gıda">Gıda</SelectItem>
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
                  placeholder="Ürünün özelliklerini yazın..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Kaydediliyor..." : "Ürünü Kaydet"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function NewProductPage() {
  return (
    <div>
      <Toaster richColors position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Yeni Ürün Ekle</h2>
        <Link href="/dashboard/products">
          <Button variant="outline">&larr; Geri Dön</Button>
        </Link>
      </div>
      <div className="bg-card p-6 sm:p-8 rounded-lg shadow-md border">
        <Suspense fallback={<div>Form yükleniyor...</div>}>
          <NewProductForm />
        </Suspense>
      </div>
    </div>
  );
}
