<script>
  import keydown from '$lib/keydown';
  import { createEventDispatcher, onMount } from 'svelte';
  const dispatch = createEventDispatcher();
  import { fade } from 'svelte/transition';
  import { normalizeParam } from '$lib/util';

  export let row;
  export let column;
  const { inputValue, key } = column;
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
    if (text === inputValue(row)) { // nothing to do
      dispatch('deactivate');
    } else {
      dispatch('update', {
        id: row.id,
        key,
        row,
        values: { [key]: text },
        onSuccess: (skipUpdateRow) => {
          if (!skipUpdateRow) {
            row[key] = text;
          }
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
  use:keydown={{ enter: handleEnter, esc: () => dispatch('deactivate') }}
  in:fade|local={{ duration: 200 }}
>
  <span>{inputValue(row)}</span>
</td>
