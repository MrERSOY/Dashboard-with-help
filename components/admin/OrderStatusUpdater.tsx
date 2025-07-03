// components/admin/OrderStatusUpdater.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Bileşenin alacağı propların tip tanımı
interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: OrderStatus;
}

// Enum değerlerini okunabilir etiketlere çeviren nesne
const statusLabels: { [key in OrderStatus]: string } = {
  PENDING: "Beklemede",
  PAID: "Ödendi",
  SHIPPED: "Kargolandı",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal Edildi",
};

export function OrderStatusUpdater({
  orderId,
  currentStatus,
}: OrderStatusUpdaterProps) {
  const router = useRouter();
  const [newStatus, setNewStatus] = useState<OrderStatus>(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  // Durum güncelleme işlemini tetikleyen fonksiyon
  const handleStatusUpdate = async () => {
    if (newStatus === currentStatus) return;

    setIsUpdating(true);
    const promise = fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Durum güncellenemedi.");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: "Durum güncelleniyor...",
      success: () => {
        router.refresh(); // Sayfadaki verileri yeniden yükler
        return "Sipariş durumu başarıyla güncellendi.";
      },
      // DÜZELTME: 'any' tipi yerine daha spesifik olan 'Error' tipi kullanıldı.
      error: (err: Error) => err.message,
      finally: () => setIsUpdating(false),
    });
  };

  return (
    <div className="flex items-center gap-4">
      <Select
        value={newStatus}
        onValueChange={(value) => setNewStatus(value as OrderStatus)}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.values(OrderStatus).map((status) => (
            <SelectItem key={status} value={status}>
              {statusLabels[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        onClick={handleStatusUpdate}
        disabled={isUpdating || newStatus === currentStatus}
      >
        {isUpdating ? "Kaydediliyor..." : "Kaydet"}
      </Button>
    </div>
  );
}
