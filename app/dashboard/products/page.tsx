// app/dashboard/products/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import ProductImage from "@/components/ProductImage";

export const metadata: Metadata = {
  title: "Ürün Yönetimi | Dashboard",
};

// API'den gelen veriye göre Product tipi
interface ApiProduct {
  id: number;
  title: string;
  category: string;
  price: number;
  stock: number;
  thumbnail: string;
}

// Sayfada kullanacağımız Product tipi
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "Yayında" | "Stokta Yok";
  imageUrl?: string;
}

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch("https://dummyjson.com/products?limit=30"); // 30 ürün çekelim
    if (!res.ok) throw new Error("API'den ürünler çekilemedi");
    const data = await res.json();

    return data.products.map((apiProduct: ApiProduct) => ({
      id: String(apiProduct.id),
      name: apiProduct.title,
      category: apiProduct.category,
      price: apiProduct.price,
      stock: apiProduct.stock,
      status: apiProduct.stock > 0 ? "Yayında" : "Stokta Yok",
      imageUrl: apiProduct.thumbnail,
    }));
  } catch (error) {
    console.error("Ürünleri çekerken hata:", error);
    return [];
  }
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Ürün Yönetimi</h2>
        <Link href="/dashboard/products/new">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Yeni Ürün Ekle
          </button>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Görsel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ürün Adı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Kategori
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Fiyat
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Stok
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Durum
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Eylemler</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <ProductImage src={product.imageUrl} alt={product.name} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  <Link
                    href={`/dashboard/products/${product.id}`}
                    className="hover:text-indigo-600"
                  >
                    {product.name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ₺{product.price.toLocaleString("tr-TR")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.stock}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.status === "Yayında"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/dashboard/products/edit/${product.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Düzenle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
