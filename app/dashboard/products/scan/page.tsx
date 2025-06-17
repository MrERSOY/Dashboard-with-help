// app/dashboard/products/scan/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { BarcodeScanner } from "@/components/ui/barcode-scanner";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function ScanPage() {
  const router = useRouter();

  const handleScanSuccess = (barcode: string) => {
    console.log(`Barkod okundu: ${barcode}`);
    // Barkod okunduğunda, kullanıcıyı yeni ürün ekleme sayfasına yönlendir.
    // Barkod numarası URL'e bir query parametresi olarak eklenir.
    router.push(`/dashboard/products/new?barcode=${barcode}`);
  };

  const handleScanError = (error: any) => {
    console.error("Barkod okuma hatası:", error);
    // Hata durumunda kullanıcıya bir bildirim gösterilebilir.
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Barkodu Tara</h1>
        <Link href="/dashboard/products">
          <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ChevronLeft size={16} className="mr-1" />
            Geri Dön
          </button>
        </Link>
      </div>
      <p className="text-center text-gray-500 mb-4 max-w-md">
        Ürün barkodunu kameranın görüş alanındaki yeşil kesikli çizginin içine
        hizalayın.
      </p>

      <BarcodeScanner
        onScanSuccess={handleScanSuccess}
        onScanError={handleScanError}
      />
    </div>
  );
}
