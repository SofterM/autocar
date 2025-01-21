import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ปิดการตรวจสอบ ESLint ระหว่าง build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ปิดการตรวจสอบ TypeScript errors ระหว่าง build
    ignoreBuildErrors: true,
  },
  // เพิ่ม config options อื่นๆ ที่นี่ถ้าจำเป็น
};

export default nextConfig;
