import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'verb-nurbs': path.resolve(__dirname, 'node_modules/verb-nurbs/build/js/verb.es.js'),
      // web-worker is a side-effect polyfill for Worker in Node; in the browser it's a no-op
      'web-worker': path.resolve(__dirname, 'src/shared/web-worker-shim.js'),
    },
  },
});
