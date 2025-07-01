// app/dashboard/pos/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
import {
  Search,
  X,
  Plus,
  Minus,
  ShoppingCart,
  DollarSign,
  Loader2,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

// Satış listesindeki bir ürünü temsil eden tip
interface SaleItem extends Product {
  quantity: number;
}

export default function POSPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [saleList, setSaleList] = useState<SaleItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ürün arama işlemi
  const searchProducts = useCallback(async (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch(`/api/products?query=${term}`);
      if (!response.ok) throw new Error("Ürün arama başarısız oldu.");
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu."
      );
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    searchProducts(debouncedSearchTerm);
  }, [debouncedSearchTerm, searchProducts]);

  // Ürünü satış listesine ekleme
  const addToSale = (product: Product) => {
    setSaleList((prevList) => {
      const existingItem = prevList.find((item) => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          return prevList.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          toast.warning(`Stokta yeterli ürün yok: ${product.name}`);
          return prevList;
        }
      }
      if (product.stock > 0) {
        return [...prevList, { ...product, quantity: 1 }];
      } else {
        toast.error(`${product.name} stokta kalmadı.`);
        return prevList;
      }
    });
    setSearchTerm("");
    setSearchResults([]);
  };

  // Satış listesindeki ürün miktarını değiştirme
  const updateQuantity = (productId: string, amount: number) => {
    setSaleList((prevList) =>
      prevList
        .map((item) => {
          if (item.id === productId) {
            const newQuantity = item.quantity + amount;
            if (newQuantity > item.stock) {
              toast.warning(`Maksimum stok adedine ulaşıldı: ${item.stock}`);
              return item;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  // Toplam tutarı hesaplama
  const totalAmount = useMemo(() => {
    return saleList.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [saleList]);

  // Satışı tamamlama
  const handleCompleteSale = async () => {
    setIsSubmitting(true);
    const orderData = {
      items: saleList.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    };

    const promise = fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Sipariş oluşturulamadı.");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: "Satış tamamlanıyor...",
      success: () => {
        setSaleList([]);
        return "Satış başarıyla tamamlandı!";
      },
      error: (err: Error) => err.message,
      finally: () => setIsSubmitting(false),
    });
  };

  return (
    <>
      <Toaster richColors position="top-right" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-8rem)]">
        {/* Sol Taraf: Ürün Arama ve Satış Listesi */}
        <div className="lg:col-span-2 bg-card p-4 md:p-6 rounded-lg shadow-md border flex flex-col">
          <h1 className="text-2xl font-bold mb-4">Hızlı Satış (POS)</h1>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Ürün adı veya barkod ile ara..."
              className="pl-10 text-base h-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" />
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="border rounded-md max-h-60 overflow-y-auto mb-4 z-10 bg-card shadow-lg">
              {searchResults.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                  onClick={() => addToSale(product)}
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={product.images[0] || "/placeholder.png"}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="rounded-md"
                    />
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Stok: {product.stock}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold">
                    {formatCurrency(product.price)}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="flex-grow overflow-y-auto border-t pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[55%]">Ürün</TableHead>
                  <TableHead className="text-center">Miktar</TableHead>
                  <TableHead className="text-right">Tutar</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {saleList.length > 0 ? (
                  saleList.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(item.price * item.quantity)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() =>
                            setSaleList((prev) =>
                              prev.filter((p) => p.id !== item.id)
                            )
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center h-48 text-muted-foreground"
                    >
                      <ShoppingCart className="mx-auto h-12 w-12 text-gray-300" />
                      Satış listesi boş
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Sağ Taraf: Ödeme */}
        <div className="bg-card p-6 rounded-lg shadow-md border flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold mb-6">Sipariş Özeti</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-lg">
                <span className="text-muted-foreground">Ara Toplam</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-muted-foreground">KDV (%20)</span>
                <span>{formatCurrency(totalAmount * 0.2)}</span>
              </div>
              <div className="border-t pt-4 mt-4 flex justify-between text-2xl font-bold">
                <span>TOPLAM</span>
                <span>{formatCurrency(totalAmount * 1.2)}</span>
              </div>
            </div>
          </div>
          <Button
            size="lg"
            className="w-full h-16 text-xl mt-6"
            disabled={saleList.length === 0 || isSubmitting}
            onClick={handleCompleteSale}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            ) : (
              <DollarSign className="mr-2 h-6 w-6" />
            )}
            {isSubmitting ? "İşleniyor..." : "Satışı Tamamla"}
          </Button>
        </div>
      </div>
    </>
  );
}
