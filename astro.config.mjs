// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const isBuild = process.env.NODE_ENV == "production";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [
    tailwind(),
    react(),
  ],
  vite: {
    plugins: [
      ...(isBuild ? [nodePolyfills()] : []),
    ],
  },
  adapter: isBuild ? cloudflare() : undefined,
  devToolbar: {
    enabled: false,
  },
  server: {
    allowedHosts: true,
    host: true,
  },
});
