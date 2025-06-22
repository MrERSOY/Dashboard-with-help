// app/dashboard/products/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { ObjectId } from "mongodb";

// Veritabanından gelen ürün tipi
interface Product {
  _id: ObjectId;
  name: string;
  category: string;
  price: number;
  stock: number;
  image_url?: string;
}

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error("Ürünler yüklenemedi.");
        }
        const data = await response.json();
        setAllProducts(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu"
        );
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allProducts, searchTerm]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Ürün Yönetimi</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Ürün ara..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <Link href="/dashboard/products/new">
            <Button>Yeni Ürün Ekle</Button>
          </Link>
        </div>
      </div>
      <div className="bg-card rounded-lg shadow-md border overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Görsel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Ürün Adı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Kategori
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Fiyat
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Stok
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Eylemler</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center p-8">
                  Yükleniyor...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-destructive">
                  {error}
                </td>
              </tr>
            ) : paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => (
                <tr key={product._id.toString()} className="hover:bg-muted/50">
                  <td className="p-4">
                    <Image
                      src={product.image_url || "https://placehold.co/40x40"}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4 font-medium">
                    <Link
                      href={`/dashboard/products/edit/${product._id.toString()}`}
                      className="hover:text-primary"
                    >
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {product.category}
                  </td>
                  <td className="px-6 py-4">
                    ₺{product.price.toLocaleString("tr-TR")}
                  </td>
                  <td className="px-6 py-4 font-semibold">{product.stock}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/dashboard/products/edit/${product._id.toString()}`}
                      className="text-primary hover:text-primary/80"
                    >
                      Düzenle
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center p-8 text-muted-foreground"
                >
                  Hiç ürün bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-center p-4 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Sayfa {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
