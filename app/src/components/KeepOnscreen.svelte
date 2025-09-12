<script>
  /**
   * @typedef {Object} Props
   * @property {string} [location]
   * @property {import('svelte').Snippet<[any]>} [children]
   */

  /** @type {Props} */
  let { location = 'right', children } = $props();
  let offscreen = $state(false);

  function trackViewport(elt) {
    const observer = new IntersectionObserver(([entry]) => {
      offscreen = entry.boundingClientRect.y < 0;
    });
    observer.observe(elt);
  }
</script>

<div>
  <div use:trackViewport></div>
  <div class:offscreen class:left={location === 'left'} class:right={location === 'right'}>
    {@render children?.({ offscreen, })}
  </div>
</div>

<style>
  .offscreen {
    position: fixed;
    top: 14px;
    z-index: 9999;

    padding-block: 14px;
    padding-inline: 18px;

    border: 1px solid #999;
    box-shadow: 0 0 16px 4px rgba(0, 0, 0, 0.25);
    border-radius: 6px;
    background: white;
  }

  .right {
    right: 14px;  
  }

  .left {
    left: 14px;
  }
</style>
