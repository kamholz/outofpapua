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
  const stringifyFields = ['replacements', 'function', 'chain_after', 'lib'];
  const arrayFields = ['chain_after', 'lib'];

  for (const rule of rules) {
    for (const field of stringifyFields) {
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

    for (const field of stringifyFields) {
      submitValues[field] = nullify(submitValues[field]);
    }
    for (const field of arrayFields) {
      if (submitValues[field]) {
        submitValues[field] = JSON.parse(submitValues[field]);
      }
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

<div>
  <IPAConversionRuleForm rule={rulesByName[selected]} on:submit={handleSubmit} />
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
      textarea[name="replacements"] {
        block-size: 4em;
      }
      textarea[name="function"] {
        block-size: 14em;
      }
      textarea[name="chain_after"], textarea[name="lib"] {
        block-size: 2.5em;
      }
    }
  }
</style>