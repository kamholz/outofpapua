<script>
  import Icon from 'svelte-awesome';
  import { faEdit } from '@fortawesome/free-solid-svg-icons';

  let { control, row, scale } = $props();
</script>

<a href={control.link(row)} title="Edit">
  <Icon data={faEdit} {scale} />
</a>
