<script context="module">
  import * as suggest from '$actions/suggest';

  export async function load({ fetch, page: { params }, session }) {
    const props = {
      editable: session.user !== null,
    };
    const res = await fetch(`/api/source/${params.id}.json`);
    if (!res.ok) {
      return { status: 404 };
    }
    props.source = await res.json();
    if (props.editable && props.source.editable) {
      props.protolangSuggest = await suggest.protolang(fetch);
    }
    return { props };
  }
</script>

<script>
  import EditSourceForm from './_EditForm.svelte';
  import { getPreferences } from '$lib/stores';
  import { setContext } from 'svelte';

  export let source;
  export let editable;
  setContext('editable', editable);
  export let protolangSuggest = null;
  if (protolangSuggest) {
    setContext('protolangSuggest', protolangSuggest);
  }
  setContext('preferences', getPreferences());
</script>

<h3>Source: {source.reference}</h3>
<EditSourceForm {source} />
