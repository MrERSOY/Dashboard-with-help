// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co", // imgbb.com için
        port: "",
        pathname: "/**", // Bu domaindeki tüm yollara izin ver
      },
      {
        protocol: "https",
        hostname: "placehold.co", // Placeholder resimler için
        port: "",
        pathname: "/**",
      },
      // Gelecekte başka servisler eklerseniz buraya ekleyebilirsiniz.
    ],
  },
};

module.exports = nextConfig;
