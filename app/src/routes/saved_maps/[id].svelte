<script context="module">
  import { serializeArrayParam } from '$lib/util';

  export async function load({ fetch, params }) {
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
          redirect: `/sets/${sets[0]}/map?id=${id}`,
        };
      } else {
        return {
          status: 302,
          redirect: `/sets/map?id=${id}&sets=${serializeArrayParam(sets)}`,
        };
      }
    } else if (entries) {
      return {
        status: 302,
        redirect: `/map?id=${id}&entries=${serializeArrayParam(entries)}`,
      };
    }

    return { props };
  }
</script>