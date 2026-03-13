import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export", // <-- ОТКЛЮЧАЕМ ДЛЯ СЕРВЕРА COOLIFY
  images: {
    unoptimized: true, // <-- Это можно оставить, серверу не помешает
  },
};

export default nextConfig;
