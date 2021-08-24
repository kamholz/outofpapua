<script>
  import Icon from 'svelte-awesome';
  import { faCircle as faCircleRegular } from '@fortawesome/free-regular-svg-icons';
  import { faCircle as faCircleSolid } from '@fortawesome/free-solid-svg-icons';
  import { getContext } from 'svelte';

  export let control;
  export let row;
  export let scale;

  const selection = getContext('selection');
  const { id } = row;

  function handleSelect() {
    if ($selection[id]) {
      delete $selection[id];
    } else {
      $selection[id] = row;
    }
    if (row.set_id) {
      for (const selectedRow of Object.values($selection)) {
        if (selectedRow.set_id && selectedRow.set_id !== row.set_id) {
          delete $selection[selectedRow.id];
        }
      }
    }
    $selection = $selection;
  }
</script>

<span title="Select" on:click={handleSelect}>
  <Icon data={$selection[id] ? faCircleSolid : faCircleRegular} {scale} />
</span>
