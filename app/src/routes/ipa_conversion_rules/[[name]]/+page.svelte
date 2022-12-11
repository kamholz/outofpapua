<script>
  import Alert from '$components/Alert.svelte';
  import CreateForm from './CreateForm.svelte';
  import EditForm from './EditForm.svelte';
  import Svelecte from '$lib/svelecte';
  import keydown from '$lib/keydown';
  import { arrayFields, nullifyFields } from './+page';
  import { goto } from '$app/navigation';
  import { nullify } from '$lib/util';
  import { pageLoading } from '$lib/stores';

  export let data;
  $: ({
    name,
    rules,
  } = data);

  let selected = findRule(data.name) || {};
  $: rule = { ...selected };

  const codeByName = {};
  let testInput = '';
  let testOutput = '';
  let promise;

  function handleChange() {
    testOutput = '';
    window.history.pushState(null, '', ruleUrl(selected.name));
  }

  async function handleSubmit(e) {
    const values = { ...e.detail.values };
  
    for (const field of nullifyFields) {
      values[field] = nullify(values[field]);
    }
    for (const field of arrayFields) {
      if (values[field]) {
        values[field] = JSON.parse(values[field]);
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
          body: JSON.stringify(values),
        });
        if (!res.ok) {
          throw new Error('Could not save');
        }
      })();
      await promise;
      delete codeByName[selected.name];

      if (values.name === selected.name) {
        Object.assign(findRule(selected.name), values);
      } else {
        goto(ruleUrl(values.name));
      }
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
        console.error(e);
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

  function findRule(name) {
    return data.rules.find((rule) => rule.name === name);
  }

  function ruleUrl(name) {
    return `/ipa_conversion_rules/${name}`;
  }
</script>

<svelte:head>
  <title>IPA Conversion Rulesets | Out of Papua</title>
</svelte:head>

<h2>IPA Conversion Rulesets</h2>

<div class="choose">
  <span>Choose rule set:</span>
  <Svelecte
    options={rules}
    valueField="name"
    value={name}
    bind:readSelection={selected}
    on:change={handleChange}
  />
</div>

<div class="rule">
  {#if promise}
    {#await promise catch { message } }
      <Alert type="error" {message} />
    {/await}
  {/if}
  <EditForm {rule} on:submit={handleSubmit} />
</div>

<h3>Conversion Tester</h3>

<div class="tester">
  <div>
    <span>Input:</span><input
      type="text"
      bind:value={testInput}
      use:keydown={{ enter: handleTest }}
    >
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

<h3>Create New Ruleset</h3>
<CreateForm on:refresh={(e) => goto(ruleUrl(e.detail))} />

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

    input {
      inline-size: 20em;
    }
  }
</style>