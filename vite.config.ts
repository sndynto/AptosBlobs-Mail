import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer'],
      globals: {
        Buffer: true,
      },
    }),
    wasm(),
    topLevelAwait(),
  ],
  build: {
    target: 'esnext',
    // Strip all console.* calls and debugger statements from production bundle
    minify: 'esbuild',
    ...(mode === 'production' && {
      esbuildOptions: {
        drop: ['console', 'debugger'],
      },
    }),
  },
  // Also apply via esbuild directly for production
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  optimizeDeps: {
    exclude: ['@shelby-protocol/clay-codes'],
  },
}))
