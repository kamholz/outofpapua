<script context="module">
  export async function load({ fetch, session }) {
    if (!session.user?.admin) {
      return { status: 403 };
    }

    const res = await fetch('/api/ipa_conversion_rule.json?raw=1');
    if (!res.ok) {
      return { status: 500 };
    }

    return {
      props: {
        rules: (await res.json()).rows,
      },
    };
  }
</script>

<script>
  import IPAConversionRuleForm from './_Form.svelte';
  import { nullify } from '$lib/util';
  import { pageLoading } from '$lib/stores';

  export let rules;

  const rulesByName = {};
  const jsonFields = ['replacements', 'function', 'chain_after'];

  for (const rule of rules) {
    for (const field of jsonFields) {
      if (rule[field] && typeof rule[field] !== 'string') {
        rule[field] = JSON.stringify(rule[field]);
      }
    }
    rulesByName[rule.name] = rule;
  }

  let selected = 'common';

  async function handleSubmit(e) {
    const { values } = e.detail;
    const submitValues = { ...values };

    for (const field of jsonFields) {
      submitValues[field] = nullify(submitValues[field]);
    }
    if (submitValues.chain_after) {
      submitValues.chain_after = JSON.parse(submitValues.chain_after);
    }

    $pageLoading++;
    try {
      await fetch(`/api/ipa_conversion_rule/${selected}.json`, {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(submitValues),
      });
    } catch (e) {}
    $pageLoading--;
  }
</script>

<h2>IPA Conversion Rules</h2>

<label>
  Show:
  <select bind:value={selected}>
    {#each rules as rule (rule.name)}
      <option value={rule.name}>{rule.name}</option>
    {/each}
  </select>
</label>

<IPAConversionRuleForm rule={rulesByName[selected]} on:submit={handleSubmit} />

<style lang="scss">
  label {
    display: block;
    margin-block-end: var(--item-sep);
  }

  :global {
    textarea {
      font-family: "Monaco", "Menlo", monospace;
      block-size: 8em;
    }
  }
</style>