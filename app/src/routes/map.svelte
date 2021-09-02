<script context="module">
  export const ssr = false;

  export async function load({ fetch, page: { query } }) {
    const props = {};
    const res = await fetch('/api/entry/multiple.json?' + new URLSearchParams({
      ids: query.get('entries'),
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

<h2>Map from search results</h2>
<EntryMap {entries} />
