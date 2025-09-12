<script>
  import Icon from 'svelte-awesome';
  import { faCircle as faCircleRegular } from '@fortawesome/free-regular-svg-icons';
  import { faCircle as faCircleSolid } from '@fortawesome/free-solid-svg-icons';
  import { getContext } from 'svelte';

  let { control, row, scale } = $props();

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

<span title="Select" onclick={handleSelect}>
  <Icon data={$selection.has(id) ? faCircleSolid : faCircleRegular} {scale} />
</span>
