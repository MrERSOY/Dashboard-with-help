// components/ui/barcode-scanner.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { ScanLine } from "lucide-react";

interface BarcodeScannerProps {
  onScanSuccess: (text: string) => void;
  onScanError?: (error: any) => void;
}

export function BarcodeScanner({
  onScanSuccess,
  onScanError,
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState("Kamera başlatılıyor...");

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let selectedDeviceId: string;

    const startScanner = async () => {
      try {
        const videoInputDevices = await codeReader.listVideoInputDevices();
        if (videoInputDevices.length <= 0) {
          throw new Error("Kamera bulunamadı.");
        }

        // Genellikle arka kamerayı tercih etmeye çalışır
        const rearCamera =
          videoInputDevices.find((device) =>
            device.label.toLowerCase().includes("back")
          ) || videoInputDevices[0];
        selectedDeviceId = rearCamera.deviceId;

        setStatus("Barkod taranıyor...");

        await codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current!,
          (result, err) => {
            if (result) {
              setStatus("Barkod bulundu!");
              onScanSuccess(result.getText());
              codeReader.reset(); // Tarayıcıyı durdur
            }
            if (err && !(err instanceof NotFoundException)) {
              setStatus("Tarama hatası: Lütfen tekrar deneyin.");
              if (onScanError) onScanError(err);
            }
          }
        );
      } catch (error) {
        console.error("Kamera başlatma hatası:", error);
        setStatus(
          "Kamera erişiminde hata oluştu. Lütfen izinleri kontrol edin."
        );
        if (onScanError) onScanError(error);
      }
    };

    startScanner();

    // Bileşen DOM'dan kaldırıldığında kamerayı serbest bırak
    return () => {
      codeReader.reset();
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="relative w-full max-w-md mx-auto border-4 border-gray-300 rounded-lg overflow-hidden shadow-lg">
      <video ref={videoRef} className="w-full h-full object-cover" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-10/12 h-1/3 border-2 border-dashed border-green-400 rounded-md animate-pulse"></div>
      </div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="relative w-full h-full animate-scan">
          <ScanLine className="w-full text-red-500" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white text-center p-2 text-sm">
        {status}
      </div>
    </div>
  );
}

// Bu animasyonu globals.css dosyanıza ekleyebilirsiniz.
/*
@keyframes scan-anim {
  0% { transform: translateY(0%); }
  100% { transform: translateY(100%); }
}
.animate-scan {
  animation: scan-anim 3s linear infinite;
}
*/
