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
import { Camera, X } from "lucide-react";
import { useState, useEffect } from "react";
import { BarcodeScanner } from "@/components/ui/barcode-scanner";
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

// Form şeması güncellendi: image_url opsiyonel bir URL
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
  image_url: z
    .string()
    .url({ message: "Lütfen geçerli bir URL girin." })
    .optional()
    .or(z.literal("")),
});

type ProductFormData = z.infer<typeof productFormSchema>;

// Formun kendisini içeren asıl bileşen
function NewProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const barcodeFromUrl = searchParams.get("barcode");

  const [showScanner, setShowScanner] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      category: allCategories[0],
      barcode: barcodeFromUrl || "",
      name: "",
      description: "",
      price: 0,
      stock: 0,
      image_url: "",
    },
  });

  // URL'den gelen barkodu forma atamak için
  useEffect(() => {
    if (barcodeFromUrl) {
      form.setValue("barcode", barcodeFromUrl, { shouldValidate: true });
    }
  }, [barcodeFromUrl, form]);

  // Barkod tarayıcı tamamlandığında
  const handleScanComplete = (scannedBarcode: string) => {
    form.setValue("barcode", scannedBarcode, { shouldValidate: true });
    setShowScanner(false);
  };

  async function onSubmit(data: ProductFormData) {
    const promise = fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data), // image_url artık form verisinin bir parçası
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

  // Resim URL'ini anlık olarak takip etmek için
  const imageUrl = form.watch("image_url");

  return (
    <>
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
            name="image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resim URL'i</FormLabel>
                <div className="flex items-start gap-4">
                  <Image
                    src={
                      imageUrl ||
                      "https://placehold.co/100x100/e2e8f0/94a3b8?text=G%C3%B6rsel"
                    }
                    alt="Ürün Görsel Önizlemesi"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Barkod</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder="Ürün barkodunu girin veya taratın"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowScanner(true)}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
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
          </div>

          {/* Diğer form alanları... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

          <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Kaydediliyor..." : "Ürünü Kaydet"}
            </Button>
          </div>
        </form>
      </Form>

      {/* Barkod okuyucu modalı */}
      {showScanner && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-4 relative">
            <h3 className="text-lg font-medium mb-4">Barkodu Okutun</h3>
            <button
              onClick={() => setShowScanner(false)}
              className="absolute top-2 right-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <X size={20} />
            </button>
            <BarcodeScanner
              onScanSuccess={handleScanComplete}
              onScanError={(error) =>
                toast.error("Barkod okuma hatası: " + error.message)
              }
            />
          </div>
        </div>
      )}
    </>
  );
}

// Ana sayfa bileşeni, Toaster ve Suspense sarmalayıcısı kullanır
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
