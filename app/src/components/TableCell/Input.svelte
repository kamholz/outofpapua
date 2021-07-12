<script>
  import keydown from '$lib/keydown';
  import { createEventDispatcher, onMount } from 'svelte';
  const dispatch = createEventDispatcher();
  import { fade } from 'svelte/transition';
  import { normalizeParam } from '$lib/util';

  export let row;
  export let column;
  export let editingCell;
  const { inputValue, key } = column;
  let td;

  onMount(() => {
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
      editingCell = null;
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
          editingCell = null;
        },
      });
    }
  }
</script>

<td
  contenteditable="true"
  bind:this={td}
  on:blur={() => editingCell = null}
  use:keydown={{ enter: handleEnter, esc: () => editingCell = null }}
  in:fade|local={{ duration: 200 }}
>
  <span>{inputValue(row)}</span>
</td>
