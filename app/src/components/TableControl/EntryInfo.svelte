<script>
  import EntryInfoPopover from '$components/EntryInfoPopover.svelte';
  import Icon from 'svelte-awesome';
  import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

  export let control;
  export let row;
  export let scale;
</script>

<EntryInfoPopover
  bind:entry={row}
  language_id={row.language_id}
  click={true}
  linkable
>
  <Icon data={faInfoCircle} {scale} />
</EntryInfoPopover>
