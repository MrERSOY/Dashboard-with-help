// next.config.ts

/** @type {import('next').NextConfig} */
const nextConfig = {
  // `images` yapılandırması, Next.js'in harici domain'lerden resim
  // yüklemesine izin vermek için gereklidir.
  images: {
    remotePatterns: [
      // Cloudinary'den gelen resimlere izin veriyoruz.
      // Bu kural, Cloudinary hesabınızdan gelen tüm resimlere izin verir.
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      // Kodumuzda kullandığımız yer tutucu (placeholder) resimlere izin ver
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
  // Projenizin gerektirdiği başka özel yapılandırmalar varsa
  // buraya eklenebilir. Şimdilik sadece resim ayarları yeterlidir.
};

module.exports = nextConfig;
