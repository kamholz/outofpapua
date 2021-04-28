<script context="module">
  import { writable } from 'svelte/store';
  import { normalizeQuery, serializeQuery } from '$lib/util';

  export async function load({ fetch, page: { query }, session }) {
    const props = {
      editable: session.user !== null,
    };
    const json = await reload(fetch, normalizeQuery(query));
    if (!json) {
      return { status: 500, error: 'Internal error' };
    }
    Object.assign(props, json);
    props.rows = writable(props.rows);
    return { props };
  }

  export async function reload(fetch, query) {
    const res = await fetch('/api/source.json' + serializeQuery({...query, numentries: 1}));
    return res.ok ? await res.json() : null;
  }
</script>

<script>
  import { fade } from 'svelte/transition';
  import SourcesTable from './_Table.svelte';

  export let rows;
  export let query;
  export let editable;
</script>

<div in:fade={{ duration: 200 }}>
<h2>Sources</h2>
<SourcesTable
  {rows}
  {query}
  {editable}
/>
</div>