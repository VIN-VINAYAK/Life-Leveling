import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || '';
  if (mode === 'production' && (!apiUrl.startsWith('https://') || /(localhost|127\.0\.0\.1|your-domain|\.example\b)/i.test(apiUrl))) {
    throw new Error('Set VITE_API_URL to your deployed HTTPS API base before making a production build.');
  }

  return {
    plugins: [react()],
    // Capacitor loads the built app from a local WebView, so assets must use relative paths.
    base: './',
    server: {
      port: 3000,
      strictPort: true
    }
  };
});
