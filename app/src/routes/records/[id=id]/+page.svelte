<script>
  import EntryRecordFormatted from '$components/EntryRecord/Formatted.svelte';
  import EntryRecordRaw from '$components/EntryRecord/Raw.svelte';
  import { fade } from 'svelte/transition';

  export let data;
  $: ({
    record,
    record: { data: recordData, source
  }} = data);
  let showFormatted = true;
</script>

<svelte:head>
  <title>Entry from {source.reference} | Out of Papua</title>
</svelte:head>

<h2>Entry from {source.reference}: {source.language_name}</h2>
{#if record.page_num}
  <div>
    Page number: {record.page_num}
  </div>
{/if}
{#if showFormatted}
  <div in:fade>
    <EntryRecordFormatted data={recordData} {source} />
    <button type="button" on:click={() => showFormatted = false}>Show Raw Version</button>
  </div>
{:else}
  <div in:fade>
    <EntryRecordRaw data={recordData} />
    <button type="button" on:click={() => showFormatted = true}>Show Formatted Version</button>
  </div>
{/if}

<style lang="scss">
  div {
    margin-block-end: 16px;
    max-width: var(--text-max-width);
  }

  button {
    margin-block-start: 10px;
  }
</style>