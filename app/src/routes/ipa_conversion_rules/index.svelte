<script context="module">
  import { requireAdminLoad } from '$actions/auth';

  export const load = requireAdminLoad(async ({ fetch }) => {
    const res = await fetch('/api/ipa_conversion_rule.json?type=raw');
    if (!res.ok) {
      return { status: 500 };
    }

    return {
      props: {
        rules: (await res.json()).rows,
      },
    };
  });
</script>

<script>
  import Alert from '$components/Alert.svelte';
  import Form from './_Form.svelte';
  import { nullify } from '$lib/util';
  import { pageLoading } from '$lib/stores';

  export let rules;

  const arrayFields = ['chain_after', 'chain_before', 'lib'];
  const stringifyFields = [...arrayFields, 'replacements'];
  const nullifyFields = [...stringifyFields, 'function'];

  const rulesByName = {};
  for (const rule of rules) {
    for (const field of stringifyFields) {
      if (rule[field]) {
        rule[field] = JSON.stringify(rule[field]);
      }
    }
    rulesByName[rule.name] = rule;
  }

  let selected = 'common';
  let promise;

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
        const res = await fetch(`/api/ipa_conversion_rule/${selected}.json`, {
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
  <title>IPA Conversion Rules | Out of Papua</title>
</svelte:head>

<h2>IPA Conversion Rules</h2>

<label>
  Show:
  <select bind:value={selected}>
    {#each rules as rule (rule.name)}
      <option value={rule.name}>{rule.name}</option>
    {/each}
  </select>
</label>

<div>
  {#if promise}
    {#await promise catch { message } }
      <Alert type="error" {message} />
    {/await}
  {/if}
  <Form rule={rulesByName[selected]} on:submit={handleSubmit} />
</div>

<style lang="scss">
  label {
    display: block;
    margin-block-end: var(--item-sep);
  }

  div {
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
</style>