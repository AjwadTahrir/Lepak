import process from 'node:process';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss()],
    // Dev only: /api goes to the local Express server, so no CORS setup is needed locally.
    // Production builds call VITE_API_URL directly.
    server: {
      proxy: { '/api': env.VITE_PROXY_TARGET || 'http://localhost:5000' },
    },
  };
});
