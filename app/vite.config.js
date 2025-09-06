import path from 'path';
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
export default defineConfig({
  plugins: [
    sveltekit(),
  ],
  resolve: {
    alias: {
      $actions: path.resolve('./src/actions'),
      $components: path.resolve('./src/components'),
      $config: path.resolve('./src/config'),
    },
  },
  server: {
    port: 3000,
  },
});
