<script>
  import { onMount } from 'svelte';
  
  export let strings;
  strings = strings.map((v) => v.toLowerCase());
  export let collapsed = false;
  let node;

  onMount(() => {
    for (const entry of node.querySelectorAll('.entry')) {
      const textContent = entry.textContent.toLowerCase();
      if (strings.some((v) => textContent.includes(v))) {
        highlightMatches(entry);
      } else {
        // entry.style.display = 'none';
        entry.remove();
      }
    }
    node.style.display = 'flex';
  });

  function highlightMatches(node) {
    const result = document.evaluate(
      './/*/text()',
      node,
      null,
      XPathResult.UNORDERED_NODE_ITERATOR_TYPE,
      null
    );

    const matches = [];
    let resultNode;
    while ((resultNode = result.iterateNext())) {
      const parent = resultNode.parentNode;
      if (parent.className === 'label' || parent.className === 'lang') {
        continue;
      }
      const { textContent } = resultNode;
      const textContentLower = textContent.toLowerCase();
      if (strings.some((v) => textContent.includes(v))) {
        matches.push({ resultNode, textContent, textContentLower, parent });
      }
    }

    for (const match of matches) {
      const { resultNode, parent } = match;
      let { textContent, textContentLower } = match;
      for (;;) {
        for (const string of strings) {
          const index = textContentLower.indexOf(string);
          if (index !== -1) {
            if (index > 0) {
              parent.insertBefore(document.createTextNode(textContent.slice(0, index)), resultNode);
            }

            const mark = document.createElement('mark');
            mark.textContent = string;
            parent.insertBefore(mark, resultNode);

            const restIndex = index + string.length;
            textContent = textContent.slice(restIndex);
            textContentLower = textContentLower.slice(restIndex);
            continue;
          }
        }
        resultNode.textContent = textContent; // remaining unmatched text (possibly empty)
        break;
      }
    }
  }

  function toggle() {
    collapsed = !collapsed;
  }
</script>

<div class="highlighted" bind:this={node}>
  <div class="triangle" on:click={toggle}>
    {#if collapsed}
      <span>▶</span><em>show match context</em>
    {:else}
      <span>▼</span>
    {/if}
  </div>
  <div class:collapsed>
    <slot />
  </div>
</div>

<style lang="scss">
  .highlighted {
    display: none;
    padding-inline-start: 1em;

    .triangle {
      cursor: default;
      > span {
        padding-inline-end: 0.5em;
      }
    }

    .collapsed {
      display: none;
    }

    :global(mark) {
      font-weight: bold;
    }
  }
</style>