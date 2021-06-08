<script>
  import Svelecte from '$components/Svelecte.svelte';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  import { pageLoading } from '$stores';
  
  export let sourceSuggest;
  let values = {};

  function handleSubmit(e) {
    e.preventDefault();
    console.log(values);
    dispatch('submit', values);
  }
</script>

<form on:submit={handleSubmit}>
  <ul>
    <li>
      <span>Source:</span>
      <Svelecte
        options={sourceSuggest}
        disabled={$pageLoading}
        bind:value={values.source_id}
      />
    </li>
    <li>
      <span>Headword:</span>
      <input
        type="text"
        disabled={$pageLoading}
        required
        bind:value={values.headword}
      >
    </li>
    <li>
      <span>English Glosses:</span>
      <input
        type="text"
        disabled={$pageLoading}
        required
        bind:value={values.glosses}
      >
    </li>
    <li>
      <span></span>
      <button disabled={$pageLoading}>Create</button>
    </li>
  </ul>
</form>

<style lang="scss">
  form {
    flex-grow: 1;

    li {
      display: flex;
      align-items: center;
      justify-content: flex-end;

      &:not(:last-child) {
        margin-block-end: 12px;
      }

      > :first-child {
        flex-shrink: 0;
        inline-size: 8.5em;
      }

      input {
        flex-grow: 1;
      }
    }
  }
</style>