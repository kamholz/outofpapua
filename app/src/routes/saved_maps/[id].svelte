<script context="module">
  import { serializeArrayParam } from '$lib/util';

  export async function load({ fetch, page: { params } }) {
    const props = {};
    const res = await fetch(`/api/saved_map/${params.id}.json`);
    if (!res.ok) {
      return { status: 500 };
    }
    const { id, data: { sets, entries } } = await res.json();

    if (sets) {
      if (sets?.length === 1) {
        return {
          status: 302,
          redirect: `/sets/${sets[0]}/map?` + new URLSearchParams({ id }),
        };
      } else {
        return {
          status: 302,
          redirect: '/sets/map?' + new URLSearchParams({
            sets: serializeArrayParam(sets),
            id,
          }),
        };
      }
    } else if (entries) {
      return {
        status: 302,
        redirect: '/map?' + new URLSearchParams({
          entries: serializeArrayParam(entries),
          id,
        }),
      };
    }

    return { props };
  }
</script>