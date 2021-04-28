<script context="module">
  export async function load({ page: { params }, fetch }) {
    const res = await fetch(`/api/source/${params.id}.json`);
    if (!res.ok) {
      return { status: 500, error: 'Internal error' };
    }
    return { props: { source: await res.json() } };
  }
</script>

<script>
  import { session } from '$app/stores';
  import SourceForm from '$components/forms/SourceForm.svelte';

  export let source;
</script>

<h3>Source: {source.title}, {source.reference}</h3>
<SourceForm editable={$session.user} {source} />
