// next.config.mjs (veya next.config.js)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Projenizdeki mevcut diğer ayarları burada koruyun
  // reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.dummyjson.com",
        port: "",
        pathname: "/product-images/**", // Sadece bu path altındaki resimlere izin ver
      },
      // Gelecekte başka domain'ler eklemek isterseniz buraya ekleyebilirsiniz.
    ],
  },
};

export default nextConfig;
