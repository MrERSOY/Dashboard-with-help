// app/dashboard/products/page.tsx

import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Button } from "@/components/ui/button";
import Search from "@/components/ui/search";
import Pagination from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle } from "lucide-react";

const ITEMS_PER_PAGE = 10;

// Bu sayfa, verileri doğrudan sunucuda çeken bir Server Component'tir.
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

  // Prisma için arama ve filtreleme koşulunu oluştur
  const whereCondition: Prisma.ProductWhereInput = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { barcode: { contains: query, mode: "insensitive" } },
          { category: { name: { contains: query, mode: "insensitive" } } },
        ],
      }
    : {};

  // Toplam ürün ve sayfa sayısını veritabanından hesapla
  const totalProducts = await prisma.product.count({ where: whereCondition });
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  // Mevcut sayfa için ürünleri, kategori bilgileriyle birlikte veritabanından çek
  const products = await prisma.product.findMany({
    where: whereCondition,
    include: {
      category: true, // İlişkili kategori bilgisini de getir
    },
    orderBy: { createdAt: "desc" },
    take: ITEMS_PER_PAGE,
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Ürün Yönetimi</h1>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
          <Search placeholder="Ürün, kategori, barkod ara..." />
          <Link href="/dashboard/products/new" className="w-full sm:w-auto">
            <Button className="whitespace-nowrap w-full">
              <PlusCircle size={18} className="mr-2" />
              Yeni Ürün Ekle
            </Button>
          </Link>
        </div>
      </div>
      <div className="bg-card rounded-lg shadow-md border flex-grow overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-grow">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0">
              <TableRow>
                <TableHead className="w-[80px]">Görsel</TableHead>
                <TableHead>Ürün Adı</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Fiyat</TableHead>
                <TableHead className="text-right">Stok</TableHead>
                <TableHead>
                  <span className="sr-only">Eylemler</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Image
                        src={
                          product.images[0] ||
                          "https://placehold.co/40x40/e2e8f0/94a3b8?text=G%C3%B6rsel"
                        }
                        alt={product.name}
                        width={40}
                        height={40}
                        className="rounded-md object-cover aspect-square"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>
                      {product.category ? (
                        <Badge variant="outline">{product.category.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      ₺{product.price.toLocaleString("tr-TR")}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {product.stock}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/products/edit/${product.id}`}>
                          Düzenle
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Hiç ürün bulunamadı.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex w-full justify-center">
          <Pagination totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
