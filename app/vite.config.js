import path from 'path';
import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],
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
};

export default config;
