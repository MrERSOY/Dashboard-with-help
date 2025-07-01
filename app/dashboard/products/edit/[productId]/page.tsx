// app/dashboard/products/edit/[productId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Toaster, toast } from "sonner";
import { Category, Product } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
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
import { PlusCircle, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [categoryRes, productRes] = await Promise.all([
          fetch("/api/categories"),
          fetch(`/api/products/${productId}`),
        ]);

        if (!categoryRes.ok) throw new Error("Kategoriler yüklenemedi.");
        if (!productRes.ok) throw new Error("Ürün bilgileri yüklenemedi.");

        const categoryData = await categoryRes.json();
        const productData: Product = await productRes.json();

        setCategories(categoryData);

        form.reset({
          name: productData.name,
          price: productData.price,
          stock: productData.stock,
          description: productData.description || "",
          barcode: productData.barcode || "",
          categoryId: productData.categoryId || "",
          images: productData.images.map((url) => ({ url })),
        });
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    }
    if (productId) {
      fetchData();
    }
  }, [productId, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "images",
  });

  async function onSubmit(data: ProductFormData) {
    const formattedData = {
      ...data,
      images: data.images.map((img) => img.url),
    };

    const promise = fetch(`/api/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formattedData),
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ürün güncellenemedi.");
      }
      return response.json();
    });

    toast.promise(promise, {
      loading: "Değişiklikler kaydediliyor...",
      success: () => {
        router.push("/dashboard/products");
        router.refresh();
        return `Ürün başarıyla güncellendi!`;
      },
      error: (err: Error) => err.message,
    });
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    const promise = fetch(`/api/products/${productId}`, { method: "DELETE" });

    toast.promise(promise, {
      loading: "Ürün siliniyor...",
      success: () => {
        router.push("/dashboard/products");
        router.refresh();
        return "Ürün başarıyla silindi.";
      },
      error: (err: Error) => err.message || "Ürün silinirken bir hata oluştu.",
      finally: () => setIsDeleting(false),
    });
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <>
      <Toaster richColors position="top-right" />
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Ürünü Düzenle</h2>
        </div>
        <div className="bg-card p-6 sm:p-8 rounded-lg shadow-md border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Form alanları... */}
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="bg-card p-8 rounded-lg shadow-md border space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
