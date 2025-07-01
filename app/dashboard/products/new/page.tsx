// app/dashboard/products/new/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Toaster, toast } from "sonner";
import { Category } from "@prisma/client";

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
import { PlusCircle, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Form için veri doğrulama şeması
const productFormSchema = z.object({
  name: z.string().min(3, { message: "Ürün adı en az 3 karakter olmalıdır." }),
  description: z.string().optional(),
  price: z.coerce
    .number({ invalid_type_error: "Lütfen geçerli bir fiyat girin." })
    .min(0),
  stock: z.coerce
    .number({ invalid_type_error: "Lütfen geçerli bir stok girin." })
    .int(),
  categoryId: z.string().min(1, { message: "Lütfen bir kategori seçin." }),
  barcode: z.string().optional(),
  images: z
    .array(
      z.object({
        url: z.string().url({ message: "Lütfen geçerli bir URL girin." }),
      })
    )
    .min(1, "En az bir resim URL'i eklenmelidir."),
});

type ProductFormData = z.infer<typeof productFormSchema>;

// Ana Sayfa Bileşeni
export default function NewProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Kategorileri API'den çek
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) throw new Error("Kategoriler yüklenemedi.");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        setIsLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      categoryId: "",
      barcode: searchParams.get("barcode") || "",
      images: [{ url: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "images",
  });

  async function onSubmit(data: ProductFormData) {
    const formattedData = {
      ...data,
      images: data.images.map((img) => img.url), // API'ye sadece URL dizisi gönder
    };

    const promise = fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formattedData),
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ürün oluşturulamadı.");
      }
      return response.json();
    });

    toast.promise(promise, {
      loading: "Ürün kaydediliyor...",
      success: () => {
        router.push("/dashboard/products");
        router.refresh(); // Sayfayı yenileyerek yeni ürünü listede göster
        return `Ürün başarıyla eklendi!`;
      },
      error: (err: any) => err.message,
    });
  }

  return (
    <>
      <Toaster richColors position="top-right" />
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Yeni Ürün Ekle</h2>
          <Button asChild variant="outline">
            <Link href="/dashboard/products">&larr; Geri Dön</Link>
          </Button>
        </div>
        <div className="bg-card p-6 sm:p-8 rounded-lg shadow-md border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ürün Adı</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Örn: Akıllı Telefon X1 Pro"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Ürün Resimleri</FormLabel>
                <div className="space-y-4 mt-2">
                  {fields.map((field, index) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={`images.${index}.url`}
                      render={({ field: inputField }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input
                                placeholder="https://..."
                                {...inputField}
                              />
                            </FormControl>
                            {fields.length > 1 && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => remove(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => append({ url: "" })}
                >
                  <PlusCircle size={16} className="mr-2" />
                  Resim Ekle
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barkod</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ürün barkodunu girin veya taratın"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori</FormLabel>
                      {isLoadingCategories ? (
                        <Skeleton className="h-10 w-full" />
                      ) : (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Bir kategori seçin..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting
                    ? "Kaydediliyor..."
                    : "Ürünü Kaydet"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}
