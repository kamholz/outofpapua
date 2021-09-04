<script context="module">
  export const ssr = false;

  export async function load({ fetch, page: { params } }) {
    const props = {};

    const res = await fetch(`/api/set/${params.id}.json`);
    if (!res.ok) {
      return { status: 404 };
    }
    props.set = await res.json();

    return { props };
  }
</script>

<script>
  import SetMap from '$components/SetMap.svelte';

  export let set;
</script>

<h2>Set map: {set.name_auto.txt}</h2>
<SetMap members={set.members} />
