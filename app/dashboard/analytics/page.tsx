// app/dashboard/analytics/page.tsx
import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";

export const metadata: Metadata = {
  title: "Analitik | Dashboard",
};

export default function AnalyticsPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <BarChart3 className="w-8 h-8 text-gray-700" />
        <h1 className="text-3xl font-bold">Analitik</h1>
      </div>
      <p className="text-gray-600 mb-8">
        İşletmenizin performansını detaylı grafikler ve metriklerle analiz edin.
      </p>

      {/* Örnek Analitik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-lg shadow">
          <h3 className="text-md font-medium text-gray-500">Toplam Ciro</h3>
          <p className="text-3xl font-semibold mt-2">₺1,250.00</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow">
          <h3 className="text-md font-medium text-gray-500">Yeni Müşteriler</h3>
          <p className="text-3xl font-semibold mt-2">1,234</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow">
          <h3 className="text-md font-medium text-gray-500">Aktif Hesaplar</h3>
          <p className="text-3xl font-semibold mt-2">45,678</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow">
          <h3 className="text-md font-medium text-gray-500">Büyüme Oranı</h3>
          <p className="text-3xl font-semibold mt-2">+4.5%</p>
        </div>
      </div>

      {/* Örnek Grafik Alanı */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Toplam Ziyaretçiler</h2>
        <div className="h-80 bg-gray-200 rounded-md flex items-center justify-center">
          <p className="text-gray-500">Ziyaretçi grafiği burada yer alacak.</p>
        </div>
      </div>
    </div>
  );
}
