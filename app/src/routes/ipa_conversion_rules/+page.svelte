<script>
  import Alert from '$components/Alert.svelte';
  import Form from './Form.svelte';
  import Svelecte from '$lib/svelecte';
  import { arrayFields, nullifyFields } from './+page';
  import { nullify } from '$lib/util';
  import { pageLoading } from '$lib/stores';

  export let data;
  $: ({ rules } = data);

  let selected = data.rules.find((rule) => rule.name === 'common');
  let promise;

  const codeByName = {};
  let testInput;
  let testOutput;

  $: if (selected) {
    testOutput = '';
  }

  async function handleSubmit(e) {
    const submitValues = { ...e.detail.values };
    for (const field of nullifyFields) {
      submitValues[field] = nullify(submitValues[field]);
    }
    for (const field of arrayFields) {
      if (submitValues[field]) {
        submitValues[field] = JSON.parse(submitValues[field]);
      }
    }

    $pageLoading++;
    try {
      promise = (async () => {
        const res = await fetch(`/api/ipa_conversion_rule/${selected.name}`, {
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
      delete codeByName[selected.name];
    } catch (e) {}
    $pageLoading--;
  }

  async function handleTest() {
    testOutput = '';
    if (!testInput.length) {
      return;
    }

    if (!codeByName[selected.name]) {
      $pageLoading++;
      try {
        codeByName[selected.name] = await getCode(selected.name);
      } catch (e) {}
      $pageLoading--;
    }

    const code = codeByName[selected.name];
    if (code) {
      try {
        testOutput = code(testInput);
      } catch (e) {
        testOutput = 'error evaluating code';
      }
    } else {
      testOutput = 'error fetching code';
      return;
    }
  }

  async function getCode(name) {
    const res = await fetch('/api/ipa_conversion_rule?' + new URLSearchParams({
      type: 'javascript_code',
      names: name,
    }));
    if (!res.ok) {
      throw new Error('Could not fetch code');
    }
    const code = (await res.json()).rows[0]?.javascript_code;
    if (!code) {
      throw new Error('Code not found');
    }
    return (0, eval)(code);
  }
</script>

<svelte:head>
  <title>IPA Conversion Rules | Out of Papua</title>
</svelte:head>

<h2>IPA Conversion Rules</h2>

<div class="choose">
  <span>Choose rule set:</span>
  <Svelecte
    options={rules}
    valueField="name"
    valueAsObject={true}
    bind:value={selected}
  />
</div>

<div class="rule">
  {#if promise}
    {#await promise catch { message } }
      <Alert type="error" {message} />
    {/await}
  {/if}
  <Form rule={selected} on:submit={handleSubmit} />
</div>

<h3>Tester</h3>

<div class="tester">
  <div>
    <span>Input:</span><input type="text" bind:value={testInput}>
  </div>
  <div>
    <span>Output:</span><span>{testOutput}</span>
  </div>
  <button
    type="button"
    disabled={$pageLoading}
    on:click={handleTest}
  >Run</button>
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

  .rule {
    :global {
      textarea {
        @include monospace;
      }
      textarea[name="replacements"] {
        block-size: 5em;
      }
      textarea[name="function"] {
        block-size: 12em;
      }
      textarea[name="chain_after"], textarea[name="chain_before"], textarea[name="lib"] {
        block-size: 2.5em;
      }
    }
  }

  .tester {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    > div {
      display: flex;
      margin-block-end: 20px;

      > :first-child {
        inline-size: 4em;
      }
    }
  }
</style>