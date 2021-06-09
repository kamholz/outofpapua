<script>
  import enter from '$lib/enter';
  import { createEventDispatcher, onMount } from 'svelte';
  const dispatch = createEventDispatcher();
  import { fade } from 'svelte/transition';
  import { normalizeParam } from '$lib/util';

  export let row;
  export let column;
  let td;

  onMount(() => {
    dispatch('edit', td);
      td.focus();
      const sel = window.getSelection();
      const range = new Range();
      range.selectNode(td.firstChild);
      sel.empty();
      sel.addRange(range);
  });

  function handleEnter(e) {
    const text = normalizeParam(e.currentTarget.textContent);
    if (text === row[column.key]) { // nothing to do
      dispatch('deactivate');
    } else {
      dispatch('update', {
        id: row.id,
        values: { [column.key]: text },
        onSuccess: () => {
          row[column.key] = text;
          dispatch('deactivate');
        },
      });
    }
  }
</script>

<td
  contenteditable="true"
  bind:this={td}
  on:deactivate
  on:blur={() => dispatch('deactivate')}
  use:enter={handleEnter}
  in:fade|local={{ duration: 200 }}
>
  <span>{column.value(row)}</span>
</td>
