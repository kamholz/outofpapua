<script>
  import { createEventDispatcher, onMount } from 'svelte';
  const dispatch = createEventDispatcher();
  import { nullify } from '$lib/util';

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

  function handleKeyDown(e) {
    if (e.keyCode === 13) { // enter
      e.preventDefault();
      const text = nullify(e.currentTarget.textContent.trim());
      if (text === row[column.key]) { // nothing to do
        dispatch('deactivate');
      } else {
        dispatch('update', {
          id: row.id,
          values: { [column.key]: text },
          onSuccess: () => {
            row[column.key] = text;
            dispatch('deactivate');
          }
        });
      }
    }
  }
</script>

<td
  contenteditable="true"
  bind:this={td}
  on:deactivate
  on:blur={() => dispatch('deactivate')}
  on:keydown={handleKeyDown}
>
  <span>{column.value(row)}</span>
</td>
