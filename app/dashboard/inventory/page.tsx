// app/dashboard/inventory/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useDebounce } from "use-debounce";
import { toast, Toaster } from "sonner";
import { Product } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Boxes, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

// Stoktaki bir ürünü ve yapılacak işlemi temsil eden tip
interface InventoryItem extends Product {
  adjustment: number; // Stok ekleme/çıkarma miktarı
}

export default function InventoryPage() {
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(
    null
  );

  // Ürünleri getiren fonksiyon
  const fetchProducts = useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/products?query=${query}`);
      if (!response.ok) throw new Error("Ürünler yüklenemedi.");
      const data: Product[] = await response.json();
      // Her ürüne 'adjustment' alanı ekleyerek state'i hazırla
      setProducts(data.map((p) => ({ ...p, adjustment: 0 })));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(debouncedSearchTerm);
  }, [debouncedSearchTerm, fetchProducts]);

  // Belirli bir ürün için stok ayarlama miktarını değiştir
  const handleAdjustmentChange = (productId: string, value: string) => {
    const amount = parseInt(value, 10);
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, adjustment: isNaN(amount) ? 0 : amount }
          : p
      )
    );
  };

  // Stok güncelleme işlemini API'ye gönder
  const handleStockUpdate = async (productId: string, adjustment: number) => {
    if (adjustment === 0) return;

    setUpdatingProductId(productId);
    const promise = fetch(`/api/products/${productId}/stock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adjustment }),
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Stok güncellenemedi.");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: "Stok güncelleniyor...",
      success: (updatedProduct: Product) => {
        // Liste'deki ürünü güncelle ve adjustment alanını sıfırla
        setProducts((prev) =>
          prev.map((p) =>
            p.id === updatedProduct.id
              ? { ...updatedProduct, adjustment: 0 }
              : p
          )
        );
        return "Stok başarıyla güncellendi.";
      },
      error: (err: Error) => err.message,
      finally: () => setUpdatingProductId(null),
    });
  };

  return (
    <>
      <Toaster richColors position="top-right" />
      <div className="flex flex-col h-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Boxes className="w-8 h-8" />
            Stok Yönetimi
          </h1>
          <p className="text-muted-foreground mt-2">
            Ürünlerin stok miktarlarını buradan güncelleyebilirsiniz.
          </p>
        </div>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Ürün adı veya barkod ile ara..."
              className="pl-10 text-base h-12 max-w-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="bg-card rounded-lg shadow-md border flex-grow overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-grow">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0">
                <TableRow>
                  <TableHead className="w-[40%]">Ürün</TableHead>
                  <TableHead className="text-center">Mevcut Stok</TableHead>
                  <TableHead className="w-[250px] text-center">
                    Stok Ayarlama
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-48">
                      <Loader2 className="mx-auto h-12 w-12 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : products.length > 0 ? (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <Image
                            src={product.images[0] || "/placeholder.png"}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="rounded-md object-cover aspect-square"
                          />
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(product.price)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold text-2xl">
                        {product.stock}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Input
                            type="number"
                            className="w-24 text-center"
                            placeholder="Adet"
                            value={
                              product.adjustment === 0 ? "" : product.adjustment
                            }
                            onChange={(e) =>
                              handleAdjustmentChange(product.id, e.target.value)
                            }
                            disabled={updatingProductId === product.id}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleStockUpdate(product.id, product.adjustment)
                            }
                            disabled={
                              product.adjustment === 0 ||
                              updatingProductId === product.id
                            }
                          >
                            {updatingProductId === product.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Uygula"
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center h-48 text-muted-foreground"
                    >
                      Arama kriterlerine uygun ürün bulunamadı.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}
