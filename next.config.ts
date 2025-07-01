// next.config.ts

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary'den gelen resimlere izin veriyoruz.
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      // Kodumuzda kullandığımız yer tutucu (placeholder) resimlere izin ver
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      // YENİ: imgbb.com'dan gelen resimlere izin ver
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
    ],
  },
};

module.exports = nextConfig;
