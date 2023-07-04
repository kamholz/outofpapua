<script>
  import Alert from '$components/Alert.svelte';
  import Form from '$components/Form.svelte';
  import Record from '$components/Record.svelte';
  import { getContext } from 'svelte';
  import { isEditor } from '$lib/util';
  import { pageLoading, session } from '$lib/stores';
  import * as crud from '$actions/crud';

  export let source;
  source = togglePublic(source);
  const editable = getContext('editable');
  const langSuggest = getContext('langSuggest');
  const protolangSuggest = getContext('protolangSuggest');
  const ipaConversionRuleSuggest = getContext('ipaConversionRuleSuggest');

  const fields = [
    editable && (isEditor($session.user) || source.editable)
      ?
      {
        name: 'language_id',
        label: 'Language',
        type: 'suggest',
        options: source.editable ? protolangSuggest : langSuggest,
        required: true,
      }
      :
      {
        name: 'language_name',
        label: 'Language',
        type: 'text',
        readonly: true,
      },
    {
      name: 'reference',
      label: 'Short Reference',
      type: 'text',
      required: true,
    },
    {
      name: 'reference_full',
      label: 'Full Reference',
      type: 'textarea',
    },
    {
      name: 'numentries',
      label: '# Entries',
      type: 'text',
      readonly: true,
    },
    {
      name: 'note',
      label: 'Note',
      type: 'textarea',
    },
  ];

  if (editable) {
    fields.splice(-1, 0,
      {
        name: 'ingestion_time',
        label: 'Last ingested',
        type: 'timestamp',
        readonly: true,
      }
    );
    fields.push(
      {
        name: 'public',
        label: 'Private',
        type: 'checkbox',
        readonly: !isEditor($session.user),
      }
    );
    if (!source.is_proto && isEditor($session.user)) {
      fields.push(
        {
          name: 'ipa_conversion_rule',
          label: 'IPA Conversion',
          type: 'suggest',
          options: ipaConversionRuleSuggest,
          svelecteProps: { valueField: 'name' },
        },
        {
          name: 'use_ph_for_ipa',
          label: 'Use \\ph for IPA',
          type: 'checkbox',
        },
        {
          name: 'formatting',
          label: 'Formatting rules',
          type: 'textarea',
        }
      );
    }
  }

  const update = crud.makeUpdater('source');
  let promise;

  // so we can display on form as "private"
  function togglePublic(obj) {
    return { ...obj, public: !obj.public };
  }

  async function handleUpdate(e) {
    const { values } = e.detail;
    $pageLoading++;
    try {
      promise = update({ id: source.id, values: togglePublic(values) });
      await promise;
    } catch (e) {}
    $pageLoading--;
  }
</script>

{#if editable}
  {#if promise}
    {#await promise then}
      <Alert type="success">Changes saved</Alert>
    {:catch { message }}
      <Alert type="error">{message}</Alert>
    {/await}
  {/if}
  <Form
    {fields}
    values={source}
    submitLabel="Save"
    style="--form-width: 35em; --label-width: 28%;"
    on:submit={handleUpdate}
  />
{:else}
  <Record
    {fields}
    values={source}
    style="--record-width: 35em; --label-width: 28%;"
  />
{/if}

<style lang="scss" global>
  textarea[name="formatting"] {
    @include monospace;
  }
</style>