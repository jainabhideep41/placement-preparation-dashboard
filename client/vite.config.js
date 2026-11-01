import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function spaRoutesPlugin() {
  const routes = [
    'dashboard',
    'dsa',
    'system-design',
    'systemdesign',
    'webdev',
    'web-development',
    'github',
    'github-foss',
    'readiness',
    'placement-readiness',
    'settings',
    'login',
    'u',
    'profile'
  ];

  return {
    name: 'vite-plugin-spa-routes',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const indexPath = path.join(distDir, 'index.html');
      if (!fs.existsSync(indexPath)) return;
      const htmlContent = fs.readFileSync(indexPath, 'utf-8');

      for (const route of routes) {
        const routeDir = path.join(distDir, route);
        if (!fs.existsSync(routeDir)) {
          fs.mkdirSync(routeDir, { recursive: true });
        }
        fs.writeFileSync(path.join(routeDir, 'index.html'), htmlContent, 'utf-8');
      }
      console.log(`[spaRoutesPlugin] Created static route fallbacks for ${routes.length} routes.`);
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), spaRoutesPlugin()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
