import { resolve } from 'path';

import { defineConfig, type LibraryFormats } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';


const formats: LibraryFormats[] = ['iife'];


export default defineConfig({
    plugins: [
        ...react(),
        ...cssInjectedByJsPlugin()
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.tsx'),
            name: 'GalleryUI',
            formats,
            fileName: (): string => 'global-ui-bundle.js'
        },
        cssCodeSplit: false,
        rollupOptions: {
            output: {
                inlineDynamicImports: true
            }
        }
    },
    server: {
        port: 5173,
        strictPort: false
    }
});
