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
  import SetMap from '$components/SetMap.svelte';

  export let sets;
  const members = [];
  for (const set of sets) {
    members.push(...set.members);
  }
</script>

<h2>Map from search results</h2>
<SetMap {members} />
