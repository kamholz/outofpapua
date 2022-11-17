<script>
  import Alert from '$components/Alert.svelte';
  import CreateForm from './CreateForm.svelte';
  import EditForm from './EditForm.svelte';
  import Svelecte from '$lib/svelecte';
  import { goto } from '$app/navigation';
  import { nullify } from '$lib/util';
  import { pageLoading } from '$lib/stores';

  export let data;
  $: ({
    libs,
    name,
  } = data);

  let selected = findLib(data.name) || {};
  $: lib = { ...selected };
  let promise;

  function handleChange() {
    window.history.replaceState(null, '', libUrl(selected.name));
  }

  async function handleSubmit(e) {
    const values = { ...e.detail.values };
    values.code = nullify(values.code);

    $pageLoading++;
    try {
      promise = (async () => {
        const res = await fetch(`/api/ipa_conversion_lib/${selected.name}`, {
          method: 'PUT',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(values),
        });
        if (!res.ok) {
          throw new Error('Could not save');
        }
      })();
      await promise;

      if (values.name === selected.name) {
        Object.assign(findLib(selected.name), values);
      } else {
        goto(libUrl(values.name, { replaceState: true }));
      }
    } catch (e) {}
    $pageLoading--;
  }

  function findLib(name) {
    return data.libs.find((lib) => lib.name === name);
  }

  function libUrl(name) {
    return `/ipa_conversion_libs/${name}`;
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
    value={name}
    bind:readSelection={selected}
    on:change={handleChange}
  />
</div>

<div class="lib">
  {#if promise}
    {#await promise catch { message } }
      <Alert type="error" {message} />
    {/await}
  {/if}
  <EditForm {lib} on:submit={handleSubmit} />
</div>

<h3>Create New Lib</h3>
<CreateForm on:refresh={(e) => goto(libUrl(e.detail))} />

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