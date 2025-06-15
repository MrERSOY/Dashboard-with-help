// app/dashboard/page.tsx
"use client"; // Bu sayfa artık etkileşimli olacağı için Client Component

import { useState } from "react";
// import type { Metadata } from 'next'; // KULLANILMADIĞI İÇİN KALDIRILDI
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import {
  BarChart3,
  DollarSign,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Maximize,
  X,
} from "lucide-react";
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
  Filler,
} from "chart.js";

// Chart.js bileşenlerini kaydet
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// react-grid-layout CSS dosyalarını import et
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

//--- VERİ MODELLERİ ---

// Tek bir metrik için tip tanımı
type Metric = {
  id: string;
  title: string;
  value: string;
  change: string;
  changeType: "up" | "down";
  icon: React.ElementType;
};

// Mevcut tüm metriklerin tanımı
const allMetrics: Record<string, Metric> = {
  totalRevenue: {
    id: "totalRevenue",
    title: "Toplam Ciro",
    value: "₺1,250.00",
    change: "+12.5%",
    changeType: "up",
    icon: DollarSign,
  },
  newCustomers: {
    id: "newCustomers",
    title: "Yeni Müşteriler",
    value: "+1,234",
    change: "-30%",
    changeType: "down",
    icon: Users,
  },
  activeAccounts: {
    id: "activeAccounts",
    title: "Aktif Hesaplar",
    value: "45,678",
    change: "+15%",
    changeType: "up",
    icon: Activity,
  },
  growthRate: {
    id: "growthRate",
    title: "Büyüme Oranı",
    value: "+4.5%",
    change: "+1.2%",
    changeType: "up",
    icon: BarChart3,
  },
};

// Grafik verisi oluşturma fonksiyonu (örnek)
const generateChartData = (label: string) => {
  const labels = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran"];
  const data = labels.map(() => Math.floor(Math.random() * 2000) + 500);
  return {
    labels,
    datasets: [
      {
        label: label,
        data,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
        tension: 0.3,
      },
    ],
  };
};

//--- YARDIMCI BİLEŞENLER ---

const Widget = ({
  metric,
  onShowChart,
}: {
  metric: Metric;
  onShowChart: () => void;
}) => (
  <div className="rounded-xl border bg-card text-card-foreground shadow w-full h-full flex flex-col p-6">
    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
      <h3 className="tracking-tight text-sm font-medium">{metric.title}</h3>
      <metric.icon className="h-4 w-4 text-muted-foreground" />
    </div>
    <div className="flex-1">
      <div className="text-2xl font-bold">{metric.value}</div>
      <p
        className={`text-xs ${
          metric.changeType === "up" ? "text-green-500" : "text-red-500"
        } flex items-center`}
      >
        {metric.changeType === "up" ? (
          <ArrowUpRight className="h-4 w-4" />
        ) : (
          <ArrowDownRight className="h-4 w-4" />
        )}
        {metric.change} geçen aydan
      </p>
    </div>
    <button
      onClick={onShowChart}
      className="mt-4 text-xs text-blue-500 hover:underline flex items-center gap-1"
    >
      <Maximize size={12} />
      Grafiği Görüntüle
    </button>
  </div>
);

// 'any' yerine daha spesifik 'Metric' tipi kullanıldı
const ChartModal = ({
  metric,
  onClose,
}: {
  metric: Metric;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-3xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{metric.title} - Satış Trendi</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-200"
        >
          <X size={20} />
        </button>
      </div>
      <div className="h-80">
        <Line
          data={generateChartData(metric.title)}
          options={{ responsive: true, maintainAspectRatio: false }}
        />
      </div>
    </div>
  </div>
);

//--- ANA SAYFA BİLEŞENİ ---
const ResponsiveGridLayout = WidthProvider(Responsive);

export default function DashboardPage() {
  const [layout, setLayout] = useState<Layout[]>([
    { i: "totalRevenue", x: 0, y: 0, w: 1, h: 1 },
    { i: "newCustomers", x: 1, y: 0, w: 1, h: 1 },
    { i: "activeAccounts", x: 2, y: 0, w: 1, h: 1 },
    { i: "growthRate", x: 3, y: 0, w: 1, h: 1 },
  ]);

  // 'any' yerine 'Metric | null' tipi kullanıldı
  const [modalData, setModalData] = useState<Metric | null>(null);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">
        Yapılandırılabilir Gösterge Paneli
      </h1>
      <p className="text-gray-600 mb-8">
        Kutucukları sürükleyip bırakarak veya kenarlarından çekerek yeniden
        boyutlandırabilirsiniz.
      </p>

      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 4, md: 2, sm: 1, xs: 1, xxs: 1 }}
        rowHeight={200}
        onLayoutChange={(newLayout) => setLayout(newLayout)}
      >
        {layout.map((item) => (
          <div key={item.i} className="flex items-center justify-center">
            <Widget
              metric={allMetrics[item.i]}
              onShowChart={() => setModalData(allMetrics[item.i])}
            />
          </div>
        ))}
      </ResponsiveGridLayout>

      {modalData && (
        <ChartModal metric={modalData} onClose={() => setModalData(null)} />
      )}
    </div>
  );
}
