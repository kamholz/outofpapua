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
  import EditSourceForm from './_EditForm.svelte';
  import { fade } from 'svelte/transition';
  import { session } from '$app/stores';
  import { stringify } from '$lib/util';

  export let source;
  let reference = stringify(source.reference);
</script>

<div in:fade={{ duration: 200 }}>
<h3>Source: {source.title}{reference && `, ${reference}`}</h3>
<EditSourceForm editable={$session.user} {source} />
</div>
