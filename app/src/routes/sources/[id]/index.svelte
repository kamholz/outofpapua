<script context="module">
  export async function load({ fetch, page: { params }, session }) {
    const res = await fetch(`/api/source/${params.id}.json`);
    if (!res.ok) {
      return { status: 404 };
    }
    return {
      props: {
        source: await res.json(),
        editable: session.user !== null,
      },
    };
  }
</script>

<script>
  import EditSourceForm from './_EditForm.svelte';
  import { setContext } from 'svelte';

  export let source;
  export let editable;
  setContext('editable', editable);
</script>

<h3>Source: {source.reference}</h3>
<EditSourceForm {source} />
