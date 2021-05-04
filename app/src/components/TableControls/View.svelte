<script>
  import Icon from 'svelte-awesome';
  import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

  export let control;
  export let row;
  export let scale;
</script>

<a href={control.link(row)} sveltekit:prefetch>
  <Icon data={faInfoCircle} {scale} label="View" />
</a>
