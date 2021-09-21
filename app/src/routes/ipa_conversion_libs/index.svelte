<script context="module">
  import { requireAdminLoad } from '$actions/auth';

  export const load = requireAdminLoad(async ({ fetch }) => {
    const res = await fetch('/api/ipa_conversion_lib.json');
    if (!res.ok) {
      return { status: 500 };
    }

    return {
      props: {
        libs: (await res.json()).rows,
      },
    };
  });
</script>

<script>
  import Alert from '$components/Alert.svelte';
  import Form from './_Form.svelte';
  import { nullify } from '$lib/util';
  import { pageLoading } from '$lib/stores';

  export let libs;

  const libsByName = {};

  for (const lib of libs) {
    libsByName[lib.name] = lib;
  }

  let selected = 'syllabify';
  let promise;

  async function handleSubmit(e) {
    const submitValues = { ...e.detail.values };
    submitValues.code = nullify(submitValues.code);

    $pageLoading++;
    try {
      promise = (async () => {
        const res = await fetch(`/api/ipa_conversion_lib/${selected}.json`, {
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

<h2>IPA Conversion Libs</h2>

<label>
  Show:
  <select bind:value={selected}>
    {#each libs as lib (lib.name)}
      <option value={lib.name}>{lib.name}</option>
    {/each}
  </select>
</label>

<div>
  {#if promise}
    {#await promise catch { message } }
      <Alert type="error" {message} />
    {/await}
  {/if}
  <Form lib={libsByName[selected]} on:submit={handleSubmit} />
</div>

<style lang="scss">
  label {
    display: block;
    margin-block-end: var(--item-sep);
  }

  div {
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