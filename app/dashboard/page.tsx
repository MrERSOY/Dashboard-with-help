// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import {
  BarChart3,
  DollarSign,
  Users,
  Package,
  Activity,
  Loader2,
  X,
  Maximize,
  Plus,
  MessageCircleWarning,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  BadgeCent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Gerekli CSS dosyalarını import et
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

// Veri tipleri
interface DashboardStats {
  userCount: number;
  productCount: number;
  totalStock: number;
  estimatedRevenue: number;
  topCategory: string;
  dailyOrders: number;
  dailyComplaints: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netProfit: number;
}

interface WidgetData {
  id: keyof DashboardStats;
  title: string;
  icon: React.ElementType;
}

// Tüm olası widget'ların tanımı
const ALL_WIDGETS: Record<string, WidgetData> = {
  userCount: { id: "userCount", title: "Toplam Kullanıcı", icon: Users },
  productCount: { id: "productCount", title: "Toplam Ürün", icon: Package },
  totalStock: { id: "totalStock", title: "Toplam Stok Adedi", icon: BarChart3 },
  estimatedRevenue: {
    id: "estimatedRevenue",
    title: "Tahmini Ciro",
    icon: DollarSign,
  },
  topCategory: { id: "topCategory", title: "Popüler Kategori", icon: Activity },
  dailyOrders: {
    id: "dailyOrders",
    title: "Bugün Eklenen Ürünler",
    icon: ShoppingCart,
  },
  dailyComplaints: {
    id: "dailyComplaints",
    title: "Bugün Gelen Kullanıcılar",
    icon: MessageCircleWarning,
  },
  monthlyIncome: {
    id: "monthlyIncome",
    title: "Bu Ayki Gelir",
    icon: TrendingUp,
  },
  monthlyExpenses: {
    id: "monthlyExpenses",
    title: "Bu Ayki Giderler",
    icon: TrendingDown,
  },
  netProfit: { id: "netProfit", title: "Net Kâr", icon: BadgeCent },
};

const ResponsiveGridLayout = WidthProvider(Responsive);

// Ana Dashboard Bileşeni
export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Partial<DashboardStats>>({});
  const [layout, setLayout] = useState<Layout[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [chartModalData, setChartModalData] = useState<WidgetData | null>(null);

  // Veri çekme ve layout'u localStorage'dan yükleme
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/dashboard/stats");
        if (!response.ok) throw new Error("İstatistikler yüklenemedi.");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error(error);
      }
    }

    const savedLayout = localStorage.getItem("dashboard-layout");
    if (savedLayout) {
      setLayout(JSON.parse(savedLayout));
    } else {
      // Varsayılan layout
      const defaultLayout: Layout[] = [
        { i: "userCount", x: 0, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
        { i: "productCount", x: 1, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
        { i: "totalStock", x: 2, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
        { i: "estimatedRevenue", x: 0, y: 1, w: 2, h: 1, minW: 2, minH: 1 },
      ];
      setLayout(defaultLayout);
    }

    fetchData().finally(() => setIsLoading(false));
    setIsMounted(true);
  }, []);

  const handleLayoutChange = (newLayout: Layout[]) => {
    setLayout(newLayout);
    localStorage.setItem("dashboard-layout", JSON.stringify(newLayout));
  };

  const addWidget = (widgetId: string) => {
    const newWidget: Layout = {
      i: widgetId,
      x: (layout.length * 2) % 4, // Basit bir yerleştirme mantığı
      y: Infinity, // En alta ekler
      w: 1,
      h: 1,
      minW: 1,
      minH: 1,
    };
    setLayout([...layout, newWidget]);
  };

  const removeWidget = (widgetId: string) => {
    setLayout(layout.filter((item) => item.i !== widgetId));
  };

  const generateChartData = (label: string) => ({
    labels: ["Pzt", "Salı", "Çrş", "Per", "Cum", "Cmt", "Paz"],
    datasets: [
      {
        label,
        data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 100)),
        borderColor: "#818cf8",
        backgroundColor: "rgba(129, 140, 248, 0.2)",
        fill: true,
      },
    ],
  });

  const availableWidgets = Object.values(ALL_WIDGETS).filter(
    (widget) => !layout.some((item) => item.i === widget.id)
  );

  if (!isMounted) {
    return null; // Sunucu tarafı render ile istemci tarafı render arasında uyumsuzluk olmaması için
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Genel Bakış</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button disabled={availableWidgets.length === 0}>
              <Plus className="mr-2 h-4 w-4" /> Widget Ekle
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Eklenebilecek Widget'lar</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {availableWidgets.map((widget) => (
              <DropdownMenuItem
                key={widget.id}
                onSelect={() => addWidget(widget.id)}
              >
                {widget.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }}
          rowHeight={150}
          onLayoutChange={handleLayoutChange}
        >
          {layout.map(({ i }) => {
            const widgetInfo = ALL_WIDGETS[i as keyof typeof ALL_WIDGETS];
            if (!widgetInfo) return null;

            let value = stats[widgetInfo.id as keyof DashboardStats];
            if (
              [
                "estimatedRevenue",
                "monthlyIncome",
                "monthlyExpenses",
                "netProfit",
              ].includes(widgetInfo.id)
            ) {
              value = `₺${Number(value).toLocaleString("tr-TR", {
                minimumFractionDigits: 2,
              })}`;
            }

            return (
              <div
                key={i}
                className="rounded-xl border bg-card text-card-foreground shadow flex flex-col p-4 overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <h3 className="tracking-tight text-sm font-medium">
                    {widgetInfo.title}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 -mr-2 -mt-2"
                    onClick={() => removeWidget(i)}
                  >
                    <X size={14} />
                  </Button>
                </div>
                <div className="flex-1 flex items-center">
                  <div className="text-2xl lg:text-4xl font-bold">
                    {value ?? <Loader2 className="w-6 h-6 animate-spin" />}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="self-start -ml-3 h-auto py-0"
                  onClick={() => setChartModalData(widgetInfo)}
                >
                  <Maximize size={12} className="mr-1" /> Grafik
                </Button>
              </div>
            );
          })}
        </ResponsiveGridLayout>
      )}

      {chartModalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg shadow-2xl p-6 w-full max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {chartModalData.title} - Trend Grafiği
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setChartModalData(null)}
              >
                <X size={20} />
              </Button>
            </div>
            <div className="h-80">
              <Line
                data={generateChartData(chartModalData.title)}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
