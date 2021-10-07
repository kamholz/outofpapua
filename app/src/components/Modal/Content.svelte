<script>
  import SetExport from '$components/Modal/SetExport.svelte';
  import SetExportButtons from '$components/Modal/SetExportButtons.svelte';
  import { getContext } from 'svelte';
  import { modal } from '$lib/stores';
  const { open } = getContext('simple-modal');
  $modal = { setExport };

  export function setExport(props) {
    open(SetExport, props, { closeButton: SetExportButtons });
  }
</script>

