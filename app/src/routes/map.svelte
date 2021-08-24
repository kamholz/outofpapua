<script context="module">
  import { pageMax } from '$lib/preferences';

  export const ssr = false;

  export async function load({ fetch, page: { query } }) {
    const props = {};
    const res = await fetch('/api/entry/fetch.json?' + new URLSearchParams({
      ids: query.get('entries'),
      pagesize: pageMax,
    }));
    if (!res.ok) {
      return { status: 500 };
    }
    props.entries = (await res.json()).rows;
    return { props };
  }
</script>

<script>
  import EntryMap from '$components/EntryMap.svelte';

  export let entries;
</script>

<EntryMap items={entries} getEntry={(item) => item} />
