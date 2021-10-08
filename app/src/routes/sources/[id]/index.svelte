<script context="module">
  import * as suggest from '$actions/suggest';

  export async function load({ fetch, page: { params }, session }) {
    const props = {};
    const res = await fetch(`/api/source/${params.id}.json`);
    if (!res.ok) {
      return { status: 404 };
    }
    props.source = await res.json();
    if (session.user) {
      if (props.source.editable) {
        props.protolangSuggest = await suggest.protolang(fetch);
        if (!props.protolangSuggest) {
          return { status: 500 };
        }
      }
      if (session.user.admin) {
        props.ipaConversionRuleSuggest = await suggest.ipaConversionRule(fetch);
        if (!props.ipaConversionRuleSuggest) {
          return { status: 500 };
        }
      }
    }
    return { props };
  }
</script>

<script>
  import EditSourceForm from './_EditForm.svelte';
  import { setContext } from 'svelte';

  export let source;
  export let protolangSuggest = null;
  export let ipaConversionRuleSuggest = null;
  if (protolangSuggest) {
    setContext('protolangSuggest', protolangSuggest);
  }
  if (ipaConversionRuleSuggest) {
    setContext('ipaConversionRuleSuggest', ipaConversionRuleSuggest);
  }
  if (source.formatting) {
    source.formatting = JSON.stringify(source.formatting);
  }
</script>

<svelte:head>
  <title>Source: {source.reference} | Out of Papua</title>
</svelte:head>

<h3>Source: {source.reference}</h3>
<EditSourceForm {source} />

<div>
  <a href="/sources/{source.id}/entries">View Entries</a>
</div>

<style>
  div {
    margin-block-start: var(--item-sep);
  }
</style>