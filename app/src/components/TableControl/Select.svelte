<script>
  import Icon from 'svelte-awesome';
  import { faCircle as faCircleRegular } from '@fortawesome/free-regular-svg-icons';
  import { faCircle as faCircleSolid } from '@fortawesome/free-solid-svg-icons';
  import { getContext } from 'svelte';

  export let control;control;
  export let row;
  export let scale;

  const selection = getContext('selection');
  const { id } = row;

  function handleSelect() {
    if ($selection.has(id)) {
      $selection.delete(id);
    } else {
      $selection.add(id);
    }
    $selection = $selection;
  }
</script>

<span title="Select" on:click={handleSelect}>
  <Icon data={$selection.has(id) ? faCircleSolid : faCircleRegular} {scale} />
</span>
