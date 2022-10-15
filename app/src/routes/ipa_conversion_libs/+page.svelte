<script>
  import Alert from '$components/Alert.svelte';
  import Form from './Form.svelte';
  import Svelecte from '$lib/svelecte';
  import { nullify } from '$lib/util';
  import { pageLoading } from '$lib/stores';

  export let data;
  $: ({ libs } = data);

  let selected = data.libs.find((lib) => lib.name === 'syllabify');
  let promise;

  async function handleSubmit(e) {
    const submitValues = { ...e.detail.values };
    submitValues.code = nullify(submitValues.code);

    $pageLoading++;
    try {
      promise = (async () => {
        const res = await fetch(`/api/ipa_conversion_lib/${selected.name}`, {
          method: 'PUT',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(submitValues),
        });
        if (!res.ok) {
          throw new Error('Could not save');
        }
      })();
      await promise;
    } catch (e) {}
    $pageLoading--;
  }
</script>

<svelte:head>
  <title>IPA Conversion Libs | Out of Papua</title>
</svelte:head>

<h2>IPA Conversion Libs</h2>

<div class="choose">
  <span>Choose library:</span>
  <Svelecte
    options={libs}
    valueField="name"
    valueAsObject={true}
    bind:value={selected}
  />
</div>

<div class="lib">
  {#if promise}
    {#await promise catch { message } }
      <Alert type="error" {message} />
    {/await}
  {/if}
  <Form lib={selected} on:submit={handleSubmit} />
</div>

<style lang="scss">
  .choose {
    display: block;
    margin-block-end: var(--item-sep);

    span {
      margin-inline-end: 6px;
    }

    :global {
      .svelecte-control {
        display: inline-block;
        vertical-align: middle;
        inline-size: 25em;
      }
    }
  }

  .lib {
    :global {
      textarea {
        font-family: "Monaco", "Menlo", monospace;
        padding: 4px;
      }
      textarea[name="code"] {
        block-size: 20em;
      }
    }
  }
</style>