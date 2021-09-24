<script>
  import { onMount } from 'svelte';
  
  export let strings;
  strings = strings.map((v) => v.toLowerCase());
  let node;

  onMount(() => {
    for (const entry of node.querySelectorAll('.entry')) {
      const textContent = entry.textContent.toLowerCase();
      if (strings.some((v) => textContent.includes(v))) {
        highlightMatches(entry);
      } else {
        entry.style.display = 'none';
      }
    }
    node.style.display = 'block';
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
    while (resultNode = result.iterateNext()) {
      const textContent = resultNode.textContent;
      const textContentLower = textContent.toLowerCase();
      if (strings.some((v) => textContent.includes(v))) {
        matches.push({ resultNode, textContent, textContentLower });
      }
    }

    for (let { resultNode, textContent, textContentLower } of matches) {
      const parent = resultNode.parentNode;
      while (1) {
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
</script>

<div bind:this={node}>
  <slot />
</div>

<style lang="scss">
  div {
    display: none;

    :global(mark) {
      font-weight: bold;
    }
  }
</style>