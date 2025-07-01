// app/dashboard/orders/[orderId]/page.tsx

import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Prisma, OrderStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User, Calendar, Truck, MapPin, Hash, ShoppingBag } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { OrderStatusUpdater } from "@/components/admin/OrderStatusUpdater";

// Prisma'dan gelen verinin tipini, ilişkili tüm alanları içerecek şekilde güvenle tanımlıyoruz.
const orderWithDetails = Prisma.validator<Prisma.OrderDefaultArgs>()({
  include: {
    user: true,
    items: {
      include: {
        product: true,
      },
    },
    address: true,
  },
});

type OrderWithDetails = Prisma.OrderGetPayload<typeof orderWithDetails>;

// Sipariş durumlarına göre stil belirleyen yardımcı fonksiyon
const getStatusBadgeVariant = (status: OrderStatus) => {
  switch (status) {
    case "PAID":
      return "bg-green-100 text-green-800 border-green-200 hover:bg-green-100";
    case "SHIPPED":
      return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100";
    case "DELIVERED":
      return "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100";
    case "CANCELLED":
      return "bg-red-100 text-red-800 border-red-200 hover:bg-red-100";
    default:
      return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100";
  }
};

// Enum değerlerini okunabilir etiketlere çeviren nesne
const statusLabels: { [key in OrderStatus]: string } = {
  PENDING: "Beklemede",
  PAID: "Ödendi",
  SHIPPED: "Kargolandı",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal Edildi",
};

export default async function OrderDetailPage({
  params,
}: {
  params: { orderId: string };
}) {
  const order: OrderWithDetails | null = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: {
      user: true,
      items: {
        include: {
          product: true,
        },
      },
      address: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShoppingBag className="w-8 h-8" />
          Sipariş Detayları
        </h1>
        <Button asChild variant="outline">
          <Link href="/dashboard/orders">&larr; Tüm Siparişlere Dön</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Taraf: Sipariş Bilgileri ve Ürünler */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Sipariş Edilen Ürünler</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ürün</TableHead>
                    <TableHead className="text-center">Miktar</TableHead>
                    <TableHead className="text-right">Birim Fiyat</TableHead>
                    <TableHead className="text-right">Ara Toplam</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.product.name}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.price * item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sağ Taraf: Özet Bilgiler */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Sipariş Özeti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Hash className="w-4 h-4" /> Sipariş ID
                </span>
                <span className="font-mono text-xs">{order.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Sipariş Tarihi
                </span>
                <span className="font-medium">
                  {formatDateTime(order.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Truck className="w-4 h-4" /> Sipariş Durumu
                </span>
                <Badge
                  variant="outline"
                  className={getStatusBadgeVariant(order.status)}
                >
                  {statusLabels[order.status] || order.status}
                </Badge>
              </div>
              <div className="border-t pt-4 mt-4 flex justify-between text-xl font-bold">
                <span>Toplam Tutar</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* İnteraktif durum güncelleme kartı */}
          <Card>
            <CardHeader>
              <CardTitle>Durumu Güncelle</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusUpdater
                orderId={order.id}
                currentStatus={order.status}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Müşteri Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">
                  {order.user.name || "İsimsiz Kullanıcı"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {order.user.email}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
