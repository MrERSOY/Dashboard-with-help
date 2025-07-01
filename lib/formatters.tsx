// lib/formatters.ts

/**
 * Bir sayı değerini Türk Lirası formatına çevirir.
 * Eğer değer bir sayı değilse, 'N/A' döndürerek hatayı engeller.
 * @param amount - Formatlanacak sayısal değer (number, null veya undefined olabilir).
 * @returns Formatlanmış para birimi string'i (örn: "₺1.250,50") veya 'N/A'.
 */
export const formatCurrency = (amount: number | null | undefined): string => {
  if (typeof amount !== "number") {
    return "N/A";
  }

  // JavaScript'in yerleşik Internationalization API'ını kullanır.
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(amount);
};

/**
 * Bir tarih nesnesini Türkçe ve okunaklı bir formata çevirir.
 * Bu fonksiyon, ek paket importuna gerek duymadan, JavaScript'in yerleşik
 * Intl API'ını kullanarak daha stabil bir formatlama sağlar.
 * @param date - Formatlanacak tarih nesnesi (Date, string veya number olabilir).
 * @returns Formatlanmış tarih string'i (örn: "01 Temmuz 2025, 19:03").
 */
export const formatDateTime = (date: Date | string | number): string => {
  try {
    // Intl.DateTimeFormat, tarih ve saat formatlama için en modern ve güvenilir yöntemdir.
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 24-saat formatı için
    }).format(new Date(date));
  } catch (error) {
    console.error("Invalid date provided for formatting:", date);
    return "Geçersiz Tarih";
  }
};
