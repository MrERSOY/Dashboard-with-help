// components/ProductImage.tsx
"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductImageProps {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  width = 40,
  height = 40,
  className = "rounded object-cover",
}) => {
  const [imageError, setImageError] = useState(false);

  // Eğer src yoksa veya resim yüklenirken hata oluştuysa placeholder göster
  if (!src || imageError) {
    return (
      <div
        className="bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        Görsel Yok
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => {
        setImageError(true);
      }}
    />
  );
};

export default ProductImage;
