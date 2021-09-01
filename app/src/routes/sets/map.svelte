<script context="module">
  export const ssr = false;

  export async function load({ fetch, page: { query } }) {
    const props = {};
    const res = await fetch('/api/set/multiple.json?' + new URLSearchParams({
      ids: query.get('sets'),
    }));
    if (!res.ok) {
      return { status: 500 };
    }
    props.sets = (await res.json()).rows;
    return { props };
  }
</script>

<script>
  import EntryMap from '$components/EntryMap.svelte';

  export let sets;
  const entries = [];
  for (const set of sets) {
    entries.push(...set.members.map((member) => ({ ...member.entry, language: member.language })));
  }
</script>

<h2>Map from search results</h2>
<EntryMap {entries} />
