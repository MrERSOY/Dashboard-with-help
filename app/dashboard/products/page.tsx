// app/dashboard/products/page.tsx
"use client"; // Arama, sayfalama ve gerçek zamanlı güncellemeler için

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ProductImage from "@/components/ProductImage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, ListFilter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Veritabanı tablomuzla eşleşen Product tipi
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image_url?: string;
}

// Önceden tanımlanmış, kapsamlı kategori listesi ("Süpermarket" -> "Gıda" olarak güncellendi)
const allCategories = [
  "Elektronik",
  "Giyim & Moda",
  "Ev, Yaşam & Bahçe",
  "Kozmetik & Kişisel Bakım",
  "Anne & Bebek",
  "Kitap, Müzik & Film",
  "Spor & Outdoor",
  "Oyuncak & Hobi",
  "Gıda", // Güncellendi
  "Otomotiv & Motosiklet",
  "Yapı Market",
];

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]); // Kategori filtresi için string array
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Bileşen ilk yüklendiğinde verileri çekmek için
  useEffect(() => {
    async function fetchInitialProducts() {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: dbError } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false }); // En yeni ürünler üstte

        if (dbError) throw dbError;
        setAllProducts(data || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Ürünler yüklenirken bir hata oluştu"
        );
      } finally {
        setIsLoading(false);
      }
    }
    fetchInitialProducts();
  }, []);

  // Supabase Realtime aboneliğini kurmak için
  useEffect(() => {
    const channel = supabase
      .channel("realtime products")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          console.log("Veritabanı değişikliği algılandı!", payload);
          if (payload.eventType === "INSERT") {
            setAllProducts((currentProducts) => [
              payload.new as Product,
              ...currentProducts,
            ]);
          }
          if (payload.eventType === "UPDATE") {
            setAllProducts((currentProducts) =>
              currentProducts.map((p) =>
                p.id === (payload.new as Product).id
                  ? (payload.new as Product)
                  : p
              )
            );
          }
          if (payload.eventType === "DELETE") {
            setAllProducts((currentProducts) =>
              currentProducts.filter((p) => p.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Kategori checkbox durumu değiştiğinde çalışacak fonksiyon
  const handleCategoryChange = (category: string) => {
    setSelectedCategories(
      (prev) =>
        prev.includes(category)
          ? prev.filter((c) => c !== category) // Eğer zaten seçiliyse, listeden çıkar
          : [...prev, category] // Eğer seçili değilse, listeye ekle
    );
    setCurrentPage(1); // Filtre değiştiğinde ilk sayfaya dön
  };

  // Arama ve kategoriye göre filtreleme mantığı güncellendi
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // Eğer hiçbir kategori seçilmemişse, tümünü göster. Seçilmişse, ürünün kategorisi seçilenler arasında mı diye kontrol et.
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category);
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allProducts, searchTerm, selectedCategories]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h2 className="text-3xl font-bold">Ürün Yönetimi</h2>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Ürün veya kategori ara..."
              className="pl-9 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          {/* Kategori Filtresi için DropdownMenu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <ListFilter className="h-4 w-4 mr-2" />
                Kategoriler (
                {selectedCategories.length === 0
                  ? "Tümü"
                  : selectedCategories.length}
                )
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Kategoriye Göre Filtrele</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allCategories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => handleCategoryChange(category)}
                >
                  {category}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/dashboard/products/new">
            <Button className="whitespace-nowrap w-full sm:w-auto">
              Yeni Ürün Ekle
            </Button>
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
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Eylemler</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <ProductImage
                        src={product.image_url}
                        alt={product.name}
                      />
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">
                      {product.stock}
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
            Bu kriterlere uygun ürün bulunamadı.
          </p>
        )}
      </div>
    </div>
  );
}
