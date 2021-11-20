<script context="module">
  export async function load({ page: { params }, fetch }) {
    const props = {};
    const res = await fetch(`/api/record/${params.id}.json`);
    if (!res.ok) {
      return { status: 404 };
    }
    props.record = await res.json();
    return { props };
  }
</script>

<script>
  import EntryRecordFormatted from '$components/EntryRecord/Formatted.svelte';
  import EntryRecordRaw from '$components/EntryRecord/Raw.svelte';
  import { fade } from 'svelte/transition';

  export let record;
  $: ({ data, source } = record);
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
    <EntryRecordFormatted {data} formatting={source.formatting} />
    <button type="button" on:click={() => showFormatted = false}>Show Raw Version</button>
  </div>
{:else}
  <div in:fade>
    <EntryRecordRaw {data} />
    <button type="button" on:click={() => showFormatted = true}>Show Formatted Version</button>
  </div>
{/if}

<style lang="scss">
  div {
    margin-block-end: 16px;
    max-width: var(--text-max-width);
  }

  button {
    margin-block-start: var(--item-sep);
  }
</style>