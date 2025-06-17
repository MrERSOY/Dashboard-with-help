// app/dashboard/products/new/page.tsx
"use client"; // Form ve hook'lar için Client Component

import { useState, FormEvent, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarcodeScanner } from "@/components/ui/barcode-scanner"; // Barkod okuyucu bileşenimiz
import { Camera, X } from "lucide-react";

// Form verisi için tip tanımı güncellendi
interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  barcode: string; // Barkod alanı eklendi
}

// Suspense içinde kullanılacak asıl form bileşeni
function NewProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const barcodeFromUrl = searchParams.get("barcode");

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    category: "Elektronik",
    price: 0,
    stock: 0,
    barcode: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false); // Kamera modal'ının durumunu tutar

  // URL'den gelen barkodu state'e atamak için useEffect
  useEffect(() => {
    if (barcodeFromUrl) {
      setFormData((prevState) => ({ ...prevState, barcode: barcodeFromUrl }));
    }
  }, [barcodeFromUrl]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: name === "price" || name === "stock" ? Number(value) : value,
    }));
  };

  // Barkod başarıyla okunduğunda çalışacak fonksiyon
  const handleScanComplete = (scannedBarcode: string) => {
    setFormData((prevState) => ({ ...prevState, barcode: scannedBarcode }));
    setShowScanner(false); // Tarayıcıyı kapat
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    console.log("Gönderilen Form Verisi:", formData);
    // Gerçek API isteği buraya gelecek
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    alert(`'${formData.name}' ürünü başarıyla eklendi! (Simülasyon)`);
    router.push("/dashboard/products");
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Barkod Alanı ve Tara Butonu */}
          <div className="md:col-span-2">
            <label
              htmlFor="barcode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Barkod
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                id="barcode"
                name="barcode"
                value={formData.barcode}
                onChange={handleInputChange}
                placeholder="Ürün barkodunu girin veya taratın"
                required
                className="block w-full"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowScanner(true)}
              >
                <Camera className="h-4 w-4 mr-2" />
                Tara
              </Button>
            </div>
          </div>

          {/* Diğer Form Alanları... */}
          <div className="md:col-span-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Ürün Adı
            </label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="block w-full"
            />
          </div>
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Kategori
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option>Elektronik</option>
              <option>Aksesuar</option>
              <option>Giyim</option>
              <option>Diğer</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fiyat (₺)
            </label>
            <Input
              type="number"
              id="price"
              name="price"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label
              htmlFor="stock"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Stok Adedi
            </label>
            <Input
              type="number"
              id="stock"
              name="stock"
              min="0"
              step="1"
              value={formData.stock}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="md:col-span-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Ürün Açıklaması
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            ></textarea>
          </div>
        </div>
        <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Kaydediliyor..." : "Ürünü Kaydet"}
          </Button>
        </div>
      </form>

      {/* Barkod Okuyucu Modalı */}
      {showScanner && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-4 relative">
            <h3 className="text-lg font-medium mb-4">Barkodu Okutun</h3>
            <button
              onClick={() => setShowScanner(false)}
              className="absolute top-2 right-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <X size={20} />
            </button>
            <BarcodeScanner
              onScanSuccess={handleScanComplete}
              onScanError={(error) => console.error(error)}
            />
          </div>
        </div>
      )}
    </>
  );
}

// Ana sayfa bileşeni, Suspense sarmalayıcısı kullanır
export default function NewProductPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Yeni Ürün Ekle</h2>
        <Link
          href="/dashboard/products"
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-150"
        >
          &larr; Geri Dön
        </Link>
      </div>
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
        <Suspense fallback={<div>Yükleniyor...</div>}>
          <NewProductForm />
        </Suspense>
      </div>
    </div>
  );
}
