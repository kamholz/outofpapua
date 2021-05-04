<script>
  import Icon from 'svelte-awesome';
  import { createEventDispatcher, getContext } from 'svelte';
  const dispatch = createEventDispatcher();
  import { faCircle as faCircleSolid } from '@fortawesome/free-solid-svg-icons';
  import { faCircle as faCircleRegular } from '@fortawesome/free-regular-svg-icons';

  export let control;
  export let row;
  export let scale;

  const selection = getContext('selection');
  let id = row.id;

  function handleSelect() {
    let newSelection = { ...$selection };
    if ($selection[id]) {
      delete newSelection[id];
    } else {
      newSelection[id] = row;
    }
    if (row.set_id) {
      for (const selectedRow of Object.values(newSelection)) {
        if (selectedRow.set_id && selectedRow.set_id !== row.set_id) {
          delete newSelection[selectedRow.id];
        }
      }
    }
    $selection = newSelection;
  }
</script>

<span on:click={handleSelect}>
  <Icon data={$selection[id] ? faCircleSolid : faCircleRegular} {scale} label="Select" />
</span>
