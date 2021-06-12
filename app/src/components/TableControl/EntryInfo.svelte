<script>
  import EntryOrigin from '$components/EntryOrigin.svelte';
  import Icon from 'svelte-awesome';
  import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

  export let control;
  export let row;
  export let scale;
</script>

<EntryOrigin entry={row} editable={control.editable}>
  <Icon data={faInfoCircle} {scale} label="Info" />
</EntryOrigin>
