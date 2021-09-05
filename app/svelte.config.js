import node from '@sveltejs/adapter-node';
import path from 'path';
import sveltePreprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: sveltePreprocess({
    scss: {
      prependData: "@import 'src/mixins.scss';",
    },
  }),

  kit: {
    // By default, `npm run build` will create a standard Node app.
    // You can create optimized builds for different platforms by
    // specifying a different adapter
    adapter: node(),

    // hydrate the <div id="svelte"> element in src/app.html
    target: '#svelte',

    vite: {
      optimizeDeps: {
        exclude: ['leaflet.fullscreen']
      },
      resolve: {
        alias: {
          $actions: path.resolve('./src/actions'),
          $components: path.resolve('./src/components'),
          $config: path.resolve('./src/config'),
        },
      },
    },
  },
};

export default config;
