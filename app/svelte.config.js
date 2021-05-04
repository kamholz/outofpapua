import node from '@sveltejs/adapter-node';
import path from 'path';
import sveltePreprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: sveltePreprocess(),
  kit: {
    // By default, `npm run build` will create a standard Node app.
    // You can create optimized builds for different platforms by
    // specifying a different adapter
    adapter: node(),

    // hydrate the <div id="svelte"> element in src/app.html
    target: '#svelte',

    vite: {
      resolve: {
        alias: {
          $actions: path.resolve('./src/actions'),
          $components: path.resolve('./src/components'),
          $config: path.resolve('./src/config'),
          $stores: path.resolve('./src/stores'),
        },
      },
    },
  },
};

export default config;
