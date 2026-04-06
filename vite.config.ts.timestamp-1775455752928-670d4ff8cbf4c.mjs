// vite.config.ts
import { defineConfig } from "file:///C:/Users/sandi/Downloads/sndynto/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/sandi/Downloads/sndynto/node_modules/@vitejs/plugin-react/dist/index.js";
import { nodePolyfills } from "file:///C:/Users/sandi/Downloads/sndynto/node_modules/vite-plugin-node-polyfills/dist/index.js";
import wasm from "file:///C:/Users/sandi/Downloads/sndynto/node_modules/vite-plugin-wasm/exports/import.mjs";
import topLevelAwait from "file:///C:/Users/sandi/Downloads/sndynto/node_modules/vite-plugin-top-level-await/exports/import.mjs";
var vite_config_default = defineConfig(({ mode }) => ({
  plugins: [
    react(),
    nodePolyfills({
      include: ["buffer"],
      globals: {
        Buffer: true
      }
    }),
    wasm(),
    topLevelAwait()
  ],
  build: {
    target: "esnext",
    // Strip all console.* calls and debugger statements from production bundle
    minify: "esbuild",
    ...mode === "production" && {
      esbuildOptions: {
        drop: ["console", "debugger"]
      }
    }
  },
  // Also apply via esbuild directly for production
  esbuild: {
    drop: mode === "production" ? ["console", "debugger"] : []
  },
  optimizeDeps: {
    exclude: ["@shelby-protocol/clay-codes"]
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxzYW5kaVxcXFxEb3dubG9hZHNcXFxcc25keW50b1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcc2FuZGlcXFxcRG93bmxvYWRzXFxcXHNuZHludG9cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3NhbmRpL0Rvd25sb2Fkcy9zbmR5bnRvL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCB7IG5vZGVQb2x5ZmlsbHMgfSBmcm9tICd2aXRlLXBsdWdpbi1ub2RlLXBvbHlmaWxscydcbmltcG9ydCB3YXNtIGZyb20gJ3ZpdGUtcGx1Z2luLXdhc20nXG5pbXBvcnQgdG9wTGV2ZWxBd2FpdCBmcm9tICd2aXRlLXBsdWdpbi10b3AtbGV2ZWwtYXdhaXQnXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBub2RlUG9seWZpbGxzKHtcbiAgICAgIGluY2x1ZGU6IFsnYnVmZmVyJ10sXG4gICAgICBnbG9iYWxzOiB7XG4gICAgICAgIEJ1ZmZlcjogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSksXG4gICAgd2FzbSgpLFxuICAgIHRvcExldmVsQXdhaXQoKSxcbiAgXSxcbiAgYnVpbGQ6IHtcbiAgICB0YXJnZXQ6ICdlc25leHQnLFxuICAgIC8vIFN0cmlwIGFsbCBjb25zb2xlLiogY2FsbHMgYW5kIGRlYnVnZ2VyIHN0YXRlbWVudHMgZnJvbSBwcm9kdWN0aW9uIGJ1bmRsZVxuICAgIG1pbmlmeTogJ2VzYnVpbGQnLFxuICAgIC4uLihtb2RlID09PSAncHJvZHVjdGlvbicgJiYge1xuICAgICAgZXNidWlsZE9wdGlvbnM6IHtcbiAgICAgICAgZHJvcDogWydjb25zb2xlJywgJ2RlYnVnZ2VyJ10sXG4gICAgICB9LFxuICAgIH0pLFxuICB9LFxuICAvLyBBbHNvIGFwcGx5IHZpYSBlc2J1aWxkIGRpcmVjdGx5IGZvciBwcm9kdWN0aW9uXG4gIGVzYnVpbGQ6IHtcbiAgICBkcm9wOiBtb2RlID09PSAncHJvZHVjdGlvbicgPyBbJ2NvbnNvbGUnLCAnZGVidWdnZXInXSA6IFtdLFxuICB9LFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBleGNsdWRlOiBbJ0BzaGVsYnktcHJvdG9jb2wvY2xheS1jb2RlcyddLFxuICB9LFxufSkpXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTRSLFNBQVMsb0JBQW9CO0FBQ3pULE9BQU8sV0FBVztBQUNsQixTQUFTLHFCQUFxQjtBQUM5QixPQUFPLFVBQVU7QUFDakIsT0FBTyxtQkFBbUI7QUFHMUIsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixjQUFjO0FBQUEsTUFDWixTQUFTLENBQUMsUUFBUTtBQUFBLE1BQ2xCLFNBQVM7QUFBQSxRQUNQLFFBQVE7QUFBQSxNQUNWO0FBQUEsSUFDRixDQUFDO0FBQUEsSUFDRCxLQUFLO0FBQUEsSUFDTCxjQUFjO0FBQUEsRUFDaEI7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQTtBQUFBLElBRVIsUUFBUTtBQUFBLElBQ1IsR0FBSSxTQUFTLGdCQUFnQjtBQUFBLE1BQzNCLGdCQUFnQjtBQUFBLFFBQ2QsTUFBTSxDQUFDLFdBQVcsVUFBVTtBQUFBLE1BQzlCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBRUEsU0FBUztBQUFBLElBQ1AsTUFBTSxTQUFTLGVBQWUsQ0FBQyxXQUFXLFVBQVUsSUFBSSxDQUFDO0FBQUEsRUFDM0Q7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyw2QkFBNkI7QUFBQSxFQUN6QztBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
