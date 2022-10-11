<script>
  import Alert from '$components/Alert.svelte';
  import Form from './Form.svelte';
  import { nullify } from '$lib/util';
  import { pageLoading } from '$lib/stores';

  export let data;
  $: ({ rules } = data);

  const arrayFields = ['chain_after', 'chain_before', 'lib'];
  const stringifyFields = [...arrayFields, 'replacements'];
  const nullifyFields = [...stringifyFields, 'function'];

  $: rulesByName = (() => {
    const rulesByName = {};
    for (const rule of rules) {
      for (const field of stringifyFields) {
        if (rule[field]) {
          rule[field] = JSON.stringify(rule[field]);
        }
      }
      rulesByName[rule.name] = rule;
    }
    return rulesByName;
  })();

  let selected = 'common';
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
        const res = await fetch(`/api/ipa_conversion_rule/${selected}`, {
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
      delete codeByName[selected];
    } catch (e) {}
    $pageLoading--;
  }

  async function handleTest() {
    testOutput = '';
    if (!testInput.length) {
      return;
    }

    if (!codeByName[selected]) {
      $pageLoading++;
      try {
        codeByName[selected] = await getCode(selected);
      } catch (e) {}
      $pageLoading--;
    }

    const code = codeByName[selected];
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

<label>
  Choose:
  <select bind:value={selected}>
    {#each rules as rule (rule.name)}
      <option value={rule.name}>{rule.name}</option>
    {/each}
  </select>
</label>

<div class="rules">
  {#if promise}
    {#await promise catch { message } }
      <Alert type="error" {message} />
    {/await}
  {/if}
  <Form rule={rulesByName[selected]} on:submit={handleSubmit} />
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
  label {
    display: block;
    margin-block-end: var(--item-sep)
  }

  .rules {
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