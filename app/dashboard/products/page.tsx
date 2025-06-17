// app/dashboard/products/page.tsx
"use client"; // Arama ve sayfalama state'lerini yönetmek için Client Component

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import ProductImage from "@/components/ProductImage"; // ProductImage bileşeninin yolu
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

// API'den gelen veriye göre Product tipi
interface ApiProduct {
  id: number;
  title: string;
  category: string;
  price: number;
  stock: number;
  thumbnail: string;
}

// Sayfada kullanacağımız Product tipi
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "Yayında" | "Stokta Yok";
  imageUrl?: string;
}

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10; // Sayfa başına gösterilecek ürün sayısı

  // Veri çekme işlemini useEffect içinde yapıyoruz
  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      setError(null);
      try {
        // Sayfalama ve arama yapabilmek için daha fazla ürün çekelim
        const res = await fetch("https://dummyjson.com/products?limit=100");
        if (!res.ok) throw new Error("API'den ürünler çekilemedi");
        const data = await res.json();

        const mappedProducts = data.products.map((apiProduct: ApiProduct) => ({
          id: String(apiProduct.id),
          name: apiProduct.title,
          category: apiProduct.category,
          price: apiProduct.price,
          stock: apiProduct.stock,
          status: apiProduct.stock > 0 ? "Yayında" : "Stokta Yok",
          imageUrl: apiProduct.thumbnail,
        }));
        setAllProducts(mappedProducts);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []); // Bu useEffect sadece bileşen ilk yüklendiğinde çalışır

  // Arama terimine göre ürünleri filtrele
  const filteredProducts = useMemo(() => {
    return allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allProducts, searchTerm]);

  // Sayfalama için filtrelenmiş ürünleri böl
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h2 className="text-3xl font-bold">Ürün Yönetimi</h2>
        <div className="w-full sm:w-auto flex items-center gap-2">
          {/* Arama Çubuğu */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Ürün veya kategori ara..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Arama yapıldığında ilk sayfaya dön
              }}
            />
          </div>
          <Link href="/dashboard/products/new">
            <Button className="whitespace-nowrap">Yeni Ürün Ekle</Button>
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
        {isLoading ? (
          <p className="text-center p-8">Ürünler yükleniyor...</p>
        ) : error ? (
          <p className="text-center p-8 text-red-500">{error}</p>
        ) : paginatedProducts.length > 0 ? (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {/* Tablo başlıkları (thead) aynı kalıyor */}
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Görsel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ürün Adı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fiyat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Stok
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Durum
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Eylemler</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <ProductImage src={product.imageUrl} alt={product.name} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      <Link
                        href={`/dashboard/products/${product.id}`}
                        className="hover:text-indigo-600"
                      >
                        {product.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₺{product.price.toLocaleString("tr-TR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.status === "Yayında"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/dashboard/products/edit/${product.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Düzenle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Sayfalama Kontrolleri */}
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-700">
                Sayfa {currentPage} / {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Önceki
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Sonraki
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <p className="text-center p-8 text-gray-500">
            Aranan kriterlere uygun ürün bulunamadı.
          </p>
        )}
      </div>
    </div>
  );
}
