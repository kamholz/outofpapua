<script>
  import Alert from '$components/Alert.svelte';
  import CollapseIndicator from '$components/CollapseIndicator.svelte';
  import Icon from 'svelte-awesome';
  import Input from './_Input.svelte';
  import MemberReflex from './_MemberReflex.svelte';
  import OriginSummary from '$components/OriginSummary.svelte';
  import Svelecte from '$components/Svelecte.svelte';
  import { createEventDispatcher, getContext } from 'svelte';
  const dispatch = createEventDispatcher();
  import { faCheckSquare, faEdit, faStar, faTrash } from '@fortawesome/free-solid-svg-icons';
  import { glossSummaryNoLanguage, glossesSummary, mungePos, normalizeParam, originSummary,
    parseGlosses } from '$lib/util';
  import { pageLoading, preferences } from '$lib/stores';
  import { slide } from 'svelte/transition';
  import * as crud from '$actions/crud';
  import * as crudSense from '$actions/crud/sense';
  import * as crudSetMember from '$actions/crud/setmember';

  export let member;
  export let set;
  export let collapsed;
  const editable = getContext('editable');
  const borrowlangSuggest = getContext('borrowlangSuggest');
  const promises = { pending: {}, fulfilled: {} };
  const memberKeys = new Set(['reflex']);

  const { entry, source } = member;
  const { senses } = entry;
  const values = {
    note: entry.note,
    origin: entry.origin,
    origin_language_id: entry.origin_language_id,
    origin_language_name: entry.origin_language_name,
    reflex: member.reflex,
  };
  const options = editable
    ? [...borrowlangSuggest].filter((v) => v.id !== source.language_id)
    : null;
  let editingProto = false;
  let protoValues;

  async function handleUpdate(key) {
    if (typeof values[key] === 'string' || values[key] instanceof String) {
      values[key] = normalizeParam(values[key]);
    }
    const obj = memberKeys.has(key) ? member : entry;
    if (obj[key] === values[key]) {
      return;
    }
    $pageLoading++;
    let promise;
    try {
      if (memberKeys.has(key)) {
        promise = promises.pending[key] = crudSetMember.update({
          set_id: set.id,
          entry_id: entry.id,
          values: { [key]: values[key] },
        });
        await promise;
        member[key] = values[key];
      } else {
        promise = promises.pending[key] = crud.update('entry', {
          id: entry.id,
          values: { [key]: values[key] },
        });
        await promise;
        entry[key] = values[key];
        if (key === 'origin' && entry[key] !== 'borrowed') {
          entry.origin_language_id = values.origin_language_id = null;
        }
      }
    } catch (e) {
      values[key] = obj[key];
    }
    if (promise && promise === promises.pending[key]) {
      promises.pending[key] = null;
      promises.fulfilled[key] = promise;
    }
    $pageLoading--;
  }

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete "${entry.headword}" from this set?`)) {
      return;
    }

    $pageLoading++;
    let promise;
    try {
      promise = promises.pending.delete = crudSetMember.del({ set_id: set.id, entry_id: entry.id });
      await promise;
      if (source.editable) {
        promise = promises.pending.delete = crud.del('entry', entry.id);
        await promise;
      }
      dispatch('refresh');
    } catch (e) {}
    if (promise && promise === promises.pending.delete) {
      promises.pending.delete = null;
      promises.fulfilled.delete = promise;
    }
    $pageLoading--;
  }

  function glosses() {
    return entry.senses[0].glosses[0].txt.join(', ');
  }

  function handleEditProto() {
    protoValues = {
      headword: entry.headword,
      glosses: glosses(),
    };
    editingProto = true;
  }

  function handleEditProtoCancel() {
    editingProto = false;
  }

  async function handleSaveProto() {
    for (const key of Object.keys(protoValues)) {
      protoValues[key] = protoValues[key].trim().normalize();
    }

    $pageLoading++;
    let promise;
    try {
      if (protoValues.headword !== entry.headword) {
        promise = promises.pending.saveproto = crud.update('entry', {
          id: entry.id,
          values: { headword: protoValues.headword },
        });
        await promise;
        entry.headword = protoValues.headword;
      }
      if (protoValues.glosses !== glosses()) {
        const glosses = parseGlosses(protoValues.glosses);
        promise = promises.pending.saveproto = crudSense.update({
          entry_id: entry.id,
          sense_id: entry.senses[0].id,
          values: { glosses },
        });
        await promise;
        entry.senses[0].glosses[0].txt = glosses;
      }
    } catch (e) {}

    if (promise && promise === promises.pending.saveproto) {
      promises.pending.saveproto = null;
      promises.fulfilled.saveproto = promise;
    }
    $pageLoading--;
    editingProto = false;
  }

  async function handleNameEntry() {
    $pageLoading++;
    let promise;
    try {
      promise = promises.pending.nameentry = crud.update('set', {
        id: set.id,
        values: { name_entry_id: entry.id },
      });
      await promise;
      dispatch('refresh');
    } catch (e) {}

    if (promise && promise === promises.pending.nameentry) {
      promises.pending.nameentry = null;
      promises.fulfilled.nameentry = promise;
    }
    $pageLoading--;
  }
</script>

{#if !collapsed}
  {#each Object.keys(promises.fulfilled).sort() as key (key)}
    {#await promises.fulfilled[key] catch { message }}
      <Alert type="error" {message} />
    {/await}
  {/each}
{/if}
<div class="set-item" transition:slide={{ duration: 200 }}>
  <CollapseIndicator bind:collapsed />
  <div class="set-item-label" class:fullwidth={collapsed} class:membersummary={collapsed}>
    {#if collapsed}
      <span class={entry.origin}>{source.language_name} <MemberReflex form={values.reflex} {entry} /></span>{#if senses[0]?.glosses?.[0]}<span>&nbsp;{glossSummaryNoLanguage(senses[0].glosses[0])}</span>{/if}<span><OriginSummary {entry} /></span>
    {:else}
      <p>
        <span class={entry.origin}>{source.language_name} </span>{#if editingProto}<Input bind:value={protoValues.headword} on:submit={handleSaveProto} on:cancel={handleEditProtoCancel} />{:else}<MemberReflex bind:form={values.reflex} {entry} {editable} on:change={() => handleUpdate('reflex')} />{/if}
      </p>
      <p>
        {source.reference}
      </p>
    {/if}
  </div>
  {#if !collapsed}
    <ul class="details" transition:slide|local={{ duration: 200 }}>
      {#if senses.length === 1}
        <li>
          <span>Glosses:</span>
          {#if editingProto}
            <span class="indent"><Input bind:value={protoValues.glosses} on:submit={handleSaveProto} on:cancel={handleEditProtoCancel} /></span>
          {:else}
            <span class="indent">{#if senses[0].pos}<em>{mungePos(senses[0].pos)}</em>. {/if}{glossesSummary(senses[0].glosses, $preferences)}</span>
          {/if}
        </li>
      {:else}
        {#each entry.senses as sense, i (sense.id)}
          <li>
            {#if i === 0}
              <span>Glosses:</span>
            {:else}
              <span></span>
            {/if}
            <span class="indent">{i + 1}. {#if sense.pos}<em>{mungePos(sense.pos)}</em>. {/if}{glossesSummary(sense.glosses, $preferences)}</span>
          </li>
        {/each}
      {/if}
      <li>
        <span>Origin:</span>
        {#if editable}
          <span class="radios">
            <label>
              <input
                type="radio"
                value="inherited"
                disabled={promises.pending.origin}
                bind:group={values.origin}
                on:change={() => handleUpdate('origin')}
              >
              <span>inherited</span>
            </label>
            <label>
              <input
                type="radio"
                value="borrowed"
                disabled={promises.pending.origin}
                bind:group={values.origin}
                on:change={() => handleUpdate('origin')}
              >
              <span>borrowed</span>
            </label>
            <label>
              <input
                type="radio"
                value={null}
                disabled={promises.pending.origin}
                bind:group={values.origin}
                on:change={() => handleUpdate('origin')}
              >
              <span>unknown</span>
            </label>
          </span>
        {:else}
          <span>{originSummary(values)}</span>
        {/if}
      </li>
      {#if entry.origin === 'borrowed' && editable}
        <li transition:slide|local>
          <span></span>
          <span class="originlang">
            <span class="label">Language:</span>
            <Svelecte
              {options}
              disabled={promises.pending.origin_language_id}
              bind:value={values.origin_language_id}
              on:change={() => handleUpdate('origin_language_id')}
            />
          </span>
        </li>
      {/if}
      {#if editable}
        <li>
          <span>Notes:</span>
          <textarea
            disabled={promises.pending.note}
            bind:value={values.note}
            on:change={() => handleUpdate('note')}
          />
        </li>
      {:else if values.note}
        <li>
          <span>Notes:</span>
          <span>{values.note}</span>
        </li>
      {/if}
    </ul>
    {#if editable}
      <div class="controls">
        {#if source.is_proto && set.name_auto?.entry_id !== entry.id}
          <span on:click={handleNameEntry}><Icon data={faStar} /></span>
        {/if}
        {#if source.editable}
          {#if editingProto}
            <span on:click={handleSaveProto}><Icon data={faCheckSquare} /></span>
          {:else}
            <span on:click={handleEditProto}><Icon data={faEdit} /></span>
          {/if}
        {/if}
        <span on:click={handleDelete}><Icon data={faTrash} /></span>
      </div>
    {/if}
  {/if}
</div>

<style lang="scss">
  .details {
    flex-grow: 1;
  }

  .controls {
    position: absolute;
    right: 0;
    top: 0;

    :global(.fa-icon) {
      margin-inline: 7px 2px;
    }
  }

  li {
    display: flex;

    &:not(:last-child) {
      margin-block-end: 12px;
    }

    > :first-child {
      flex-shrink: 0;
      inline-size: 5.5em;
    }
  }

  p:not(:last-child) {
    margin-block-end: 16px;
  }

  .indent {
    @include indent;
  }

  textarea {
    inline-size: 100%;
  }

  .radios {
    display: flex;
    label {
      margin-inline-end: 16px;
      display: flex;
      align-items: center;
    }
    input {
      margin-inline-end: 4px;
    }
  }

  .originlang {
    display: flex;
    align-items: center;

    .label {
      margin-inline-end: 10px;
    }

    :global(.svelecte-control .sv-control) {
      inline-size: 16em;
    }
  }
</style>
