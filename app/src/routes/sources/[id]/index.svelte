<script context="module">
  import * as suggest from '$actions/suggest';

  export async function load({ fetch, page: { params }, session }) {
    const props = {};
    const res = await fetch(`/api/source/${params.id}.json`);
    if (!res.ok) {
      return { status: 404 };
    }
    props.source = await res.json();
    if (session.user && props.source.editable) {
      props.protolangSuggest = await suggest.protolang(fetch);
    }
    return { props };
  }
</script>

<script>
  import EditSourceForm from './_EditForm.svelte';
  import { setContext } from 'svelte';

  export let source;
  export let protolangSuggest = null;
  if (protolangSuggest) {
    setContext('protolangSuggest', protolangSuggest);
  }
</script>

<h3>Source: {source.reference}</h3>
<EditSourceForm {source} />
