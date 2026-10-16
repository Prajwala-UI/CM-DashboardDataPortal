import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const basePath = process.env.REACT_APP_BASE_URL || env.REACT_APP_BASE_URL || '/';

  const processEnv = {
    NODE_ENV: mode === 'production' ? 'production' : 'development',
    PUBLIC_URL: basePath,
  };

  Object.keys(process.env).forEach((key) => {
    if (key.startsWith('REACT_APP_')) {
      processEnv[key] = process.env[key];
    }
  });

  Object.keys(env).forEach((key) => {
    if (key.startsWith('REACT_APP_') && !processEnv[key]) {
      processEnv[key] = env[key];
    }
  });

  return {
    base: basePath,
    plugins: [
      react({
        // Include .js files for JSX transformation
        include: '**/*.{jsx,js}',
      }),
    ],
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.[jt]sx?$/,
      exclude: [],
    },
    optimizeDeps: {
      entries: ['index.html'],
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    build: {
      outDir: process.env.BUILD_OUT_DIR || 'build',
      emptyOutDir: true,
      sourcemap: process.env.GENERATE_SOURCEMAP === 'true',
    },
    server: {
      port: parseInt(process.env.PORT || env.PORT || '3000', 10),
      strictPort: true,
    },
    preview: {
      port: parseInt(process.env.PORT || env.PORT || '3000', 10),
    },
    define: {
      'process.env': JSON.stringify(processEnv),
    },
    resolve: {
      alias: {
        src: path.resolve(__dirname, './src'),
      },
    },
  };
});
