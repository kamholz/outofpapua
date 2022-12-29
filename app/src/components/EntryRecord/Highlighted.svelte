<script>
  import { onMount } from 'svelte';
  
  export let strings;
  export let showUnmatchedEntries = false;
  let node;

  onMount(() => {
    for (const entry of node.querySelectorAll('.entry')) {
      if (strings) {
        const textContent = entry.textContent.toLowerCase();
        if (strings.some((v) => textContent.includes(v))) {
          highlightMatches(entry);
          continue;
        }
      }
      if (!showUnmatchedEntries) {
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
      if (strings.some((v) => textContentLower.includes(v))) {
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
            const restIndex = index + string.length;

            const mark = document.createElement('mark');
            mark.textContent = textContent.slice(index, restIndex);
            parent.insertBefore(mark, resultNode);

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
</script>

<div bind:this={node}>
  <slot />
</div>

<style lang="scss">
  div {
    display: none;
    padding-inline-start: 1em;

    :global(mark) {
      font-weight: bold;
    }
  }
</style>