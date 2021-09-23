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
  import Formatted from '$components/EntryRecord/Formatted.svelte';
  import Table from '$components/EntryRecord/Table.svelte';

  export let record;
  let showFormatted = true;
</script>

<h2>Entry from {record.source.reference}</h2>
{#if record.page_num}
  <div>
    Page number: {record.page_num}
  </div>
{/if}
{#if showFormatted}
  <Formatted {record} />
  <button type="button" on:click={() => showFormatted = false}>Show Original</button>
{:else}
  <Table {record} />
  <button type="button" on:click={() => showFormatted = true}>Show Formatted</button>
{/if}

<style lang="scss">
  div {
    margin-block-end: 16px;
  }

  button {
    margin-block-start: var(--item-sep);
  }
</style>