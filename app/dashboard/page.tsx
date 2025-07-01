// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  LineChart,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";

// API'den gelen istatistiklerin tip tanımı
interface DashboardStats {
  userCount: number;
  productCount: number;
  totalRevenue: number;
  totalOrders: number;
  salesToday: number;
  ordersToday: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Partial<DashboardStats>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/dashboard/stats");
        if (!response.ok) {
          throw new Error("İstatistikler yüklenemedi.");
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const statCards = [
    {
      title: "Toplam Ciro",
      value: stats.totalRevenue,
      icon: DollarSign,
      formatter: formatCurrency,
    },
    {
      title: "Bugünkü Satışlar",
      value: stats.salesToday,
      icon: LineChart,
      formatter: formatCurrency,
    },
    {
      title: "Toplam Sipariş",
      value: stats.totalOrders,
      icon: ShoppingCart,
    },
    {
      title: "Toplam Müşteri",
      value: stats.userCount,
      icon: Users,
    },
    {
      title: "Toplam Ürün",
      value: stats.productCount,
      icon: Package,
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Genel Bakış</h1>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {statCards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {card.formatter
                    ? card.formatter(card.value ?? 0)
                    : card.value?.toLocaleString("tr-TR") ?? "0"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Buraya ileride daha detaylı grafikler eklenebilir */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Satış Trendi</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center bg-muted/50 rounded-b-lg">
            <p className="text-muted-foreground">
              Yakında: Aylık satış grafiği burada yer alacak.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
