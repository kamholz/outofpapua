import node from '@sveltejs/adapter-node';
import { sveltePreprocess } from 'svelte-preprocess';

const ignoredWarnings = new Set([
  'a11y-autofocus',
  'a11y-click-events-have-key-events',
  'a11y-no-noninteractive-element-interactions',
  'a11y-no-static-element-interactions',
]);

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: sveltePreprocess({
    scss: {
      prependData: "@use 'src/mixins' as *;",
    },
  }),

  onwarn: (warning, defaultHandler) => {
    if (ignoredWarnings.has(warning.code)) {
      return;
    }
    // console.log(`WARNING: ${warning.code}`);
    defaultHandler(warning);
  },

  kit: {
    // By default, `npm run build` will create a standard Node app.
    // You can create optimized builds for different platforms by
    // specifying a different adapter
    adapter: node(),
  },
};

export default config;
