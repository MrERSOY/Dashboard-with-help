// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary'den resimlere izin ver
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: `/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/**`,
      },
      // Yer tutucu (placeholder) resimlere izin ver
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
    // GÜNCELLEME: SVG resimlere izin ver
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
