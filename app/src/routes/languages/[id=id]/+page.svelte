<script>
  import Alert from '$components/Alert.svelte';
  import EditForm from './EditForm.svelte';
  import { getContext, setContext } from 'svelte';
  import { goto } from '$app/navigation';
  import { pageLoading } from '$lib/stores';
  import * as crud from '$actions/crud';

  export let data;
  const {
    language,
    protolangSuggest,
  } = data;
  if (protolangSuggest) {
    setContext('protolangSuggest', protolangSuggest);
  }
  const editable = getContext('editable');

  const del = crud.makeDeleter('language');
  let promise;

  async function handleDelete() {
    if (confirm(`Are you sure you want to delete "${language.name}"?`)) {
      $pageLoading++;
      try {
        promise = del(language.id);
        await promise;
        goto('/languages');
      } catch (e) {}
      $pageLoading--;
    }
  }
</script>

<svelte:head>
  <title>Language: {language.name} | Out of Papua</title>
</svelte:head>

<h3>Language: {language.name}</h3>
{#if promise}
  {#await promise catch { message }}
    <Alert type="error" {message} />
  {/await}
{/if}
<EditForm {language} />

{#if editable && language.is_proto}
  <button type="button" class="delete" on:click={handleDelete}>Delete Language</button>
{/if}