<script>
  import EntryInfoPopover from '$components/EntryInfoPopover.svelte';
  import Icon from 'svelte-awesome';
  import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

  export let control;
  const { editable, borrowlangSuggest } = control;
  export let row;
  export let scale;
</script>

<EntryInfoPopover
  entry={row}
  {editable}
  {borrowlangSuggest}
  click={true}
>
  <Icon data={faInfoCircle} {scale} label="Info" />
</EntryInfoPopover>
