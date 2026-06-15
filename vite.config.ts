import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["images/logo-white.png", "favicon.ico"],
      manifest: {
        name: "HK Event",
        short_name: "HK Event",
        description:
          "Créez, gérez vos invitations et suivez vos invités en temps réel.",
        theme_color: "#1a1a2e",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait-primary",
        scope: "/",
        start_url: "/dashboard",
        lang: "fr",
        categories: ["business", "productivity"],
        icons: [
          {
            src: "images/logo-white.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "images/logo-white.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "images/logo-white.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api/],
      },
      devOptions: {
        enabled: true,
        suppressWarnings: true,
        navigateFallback: "/index.html",
      },
    }),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
