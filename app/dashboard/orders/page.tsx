// app/dashboard/orders/page.tsx

import Link from "next/link";
import prisma from "@/lib/prisma";
import { Prisma, OrderStatus } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime } from "@/lib/formatters";

// DÜZELTME: ESLint'e bu değişkenin sadece tip üretimi için kullanıldığını ve
// bu uyarının göz ardı edilebileceğini söylüyoruz.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _orderWithDetails = Prisma.validator<Prisma.OrderDefaultArgs>()({
  include: {
    user: { select: { name: true, email: true } },
    items: { select: { quantity: true } },
  },
});
type OrderWithDetails = Prisma.OrderGetPayload<typeof _orderWithDetails>;

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

const statusLabels: { [key in OrderStatus]: string } = {
  PENDING: "Beklemede",
  PAID: "Ödendi",
  SHIPPED: "Kargolandı",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal Edildi",
};

export default async function OrdersPage() {
  const orders: OrderWithDetails[] = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      items: { select: { quantity: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Sipariş Yönetimi</h1>
        <p className="text-muted-foreground mt-2">
          Tüm mağaza içi ve online siparişleri buradan görüntüleyin ve yönetin.
        </p>
      </div>
      <div className="bg-card rounded-lg shadow-md border flex-grow overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-grow">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0">
              <TableRow>
                <TableHead className="w-[120px]">Sipariş ID</TableHead>
                <TableHead>Müşteri</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">Tutar</TableHead>
                <TableHead>
                  <span className="sr-only">Eylemler</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {order.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="font-medium">
                      {order.user?.name ||
                        order.user?.email ||
                        "Bilinmeyen Kullanıcı"}
                    </TableCell>
                    <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusBadgeVariant(order.status)}
                      >
                        {statusLabels[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/orders/${order.id}`}>
                          Detayları Gör
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
                    Henüz hiç sipariş oluşturulmamış.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
