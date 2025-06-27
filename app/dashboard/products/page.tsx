// app/dashboard/products/page.tsx
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Search from "@/components/ui/search";
import Pagination from "@/components/ui/pagination";
import { Prisma } from "@prisma/client";

// Veritabanından gelen ürün tipi
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image_url?: string | null;
}

const ITEMS_PER_PAGE = 10;

// Bu sayfa artık bir Sunucu Bileşeni (Server Component)
export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;

  // Prisma için filtreleme koşulunu oluştur
  const whereCondition: Prisma.ProductWhereInput = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { category: { contains: query, mode: "insensitive" } },
          { barcode: { contains: query, mode: "insensitive" } },
        ],
      }
    : {};

  // Toplam ürün sayısını ve toplam sayfa sayısını veritabanından hesapla
  const totalProducts = await prisma.product.count({ where: whereCondition });
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  // Mevcut sayfa için ürünleri veritabanından çek
  const products: Product[] = await prisma.product.findMany({
    where: whereCondition,
    orderBy: { createdAt: "desc" },
    take: ITEMS_PER_PAGE,
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Ürün Yönetimi</h1>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
          <Search placeholder="Ürün, kategori veya barkod ara..." />
          <Link href="/dashboard/products/new" className="w-full sm:w-auto">
            <Button className="whitespace-nowrap w-full">Yeni Ürün Ekle</Button>
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
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-muted/50">
                  <td className="p-4">
                    <Image
                      src={
                        product.image_url ||
                        "https://placehold.co/40x40/e2e8f0/94a3b8?text=G%C3%B6rsel"
                      }
                      alt={product.name}
                      width={40}
                      height={40}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4 font-medium">
                    <Link
                      href={`/dashboard/products/edit/${product.id}`}
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
                      href={`/dashboard/products/edit/${product.id}`}
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
      </div>
      <div className="mt-4 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
