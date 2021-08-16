<script>
  import Icon from 'svelte-awesome';
  import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

  export let control;
  export let row;
  export let scale;
</script>

<a href={control.link(row)} title="View" sveltekit:prefetch>
  <Icon data={faInfoCircle} {scale} />
</a>
