import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
export default defineConfig({
  base: "/",
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      vue: "vue/dist/vue.esm-bundler.js",
    },
  },
<<<<<<< HEAD
  base: '/mujiuniv/',
});
=======
  base: "/mujiuniv/",
});
>>>>>>> 53360617fc917fb46fbd562a2a002a5e9f4e84ee
