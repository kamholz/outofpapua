<script>
  import Alert from '$components/Alert.svelte';
  import Icon from 'svelte-awesome';
  import Reflex from '$components/Reflex.svelte';
  import SvelecteLanguage from '$components/SvelecteLanguage.svelte';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  import { entryUrl, normalizeParam } from '$lib/util';
  import { faCaretDown, faCaretRight, faTrash } from '@fortawesome/free-solid-svg-icons';
  import { getContext } from 'svelte';
  import { pageLoading } from '$stores';
  import { slide } from 'svelte/transition';
  import * as crudSetMember from '$actions/crud/setmember';

  export let member;
  export let collapsed;
  const { id } = member.entry;
  const scale = 1.5;
  const promises = { pending: {}, fulfilled: {} };
  
  const { entry, source } = member;
  const reflex = member.reflex ?? entry.headword;
  const { senses } = entry;
  const { set, editable, borrowlangSuggest } = getContext('props');
  const values = {
    note: member.note,
    origin: member.origin,
    origin_language_id: member.origin_language_id,
    origin_language_name: member.origin_language_name,
  };
  const options = editable
    ? [...borrowlangSuggest].filter((v) => v.id !== source.language_id)
    : null;

  function toggleCollapsed() {
    collapsed[id] = !collapsed[id];
  }

  function originSummary() {
    let origin = values.origin ?? 'unknown';
    if (origin === 'borrowed' && values.origin_language_name) {
      origin += ` from ${values.origin_language_name}`;
    }
    return origin;
  }

  function mungePos(pos) {
    return pos.replace(/\.$/, '');
  }

  function glosses(sense) {
    return sense.glosses.map(({ language_name, txt }) =>
      `‘${txt.join(', ')}’ (${language_name})`
    ).join('; ');
  }

  function summaryGlosses(sense) {
    return `‘${sense.glosses[0].txt.join(', ')}’`;
  }

  async function handleUpdate(key) {
    if (typeof values[key] === 'string' || values[key] instanceof String) {
      values[key] = normalizeParam(values[key]);
    }
    if (member[key] === values[key]) {
      return;
    }
    $pageLoading++;
    let promise;
    try {
      promise = crudSetMember.update({ set_id: set.id, entry_id: entry.id, values: { [key]: values[key] } });
      promises.pending[key] = promise;
      await promise;
      member[key] = values[key];
      if (key === 'origin' && member[key] !== 'borrowed') {
        member.origin_language_id = values.origin_language_id = null;
      }
    } catch (e) {
      values[key] = member[key];
    }
    if (promise && promise === promises.pending[key]) {
      promises.pending[key] = null;
      promises.fulfilled[key] = promise;
    }
    $pageLoading--;
  }

  async function handleDelete() {
    $pageLoading++;
    let promise;
    try {
      promise = crudSetMember.del({ set_id: set.id, entry_id: entry.id });
      promises.pending.delete = promise;
      await promise;
      dispatch('refresh');
    } catch (e) {}
    if (promise && promise === promises.pending.delete) {
      promises.pending.delete = null;
      promises.fulfilled.delete = promise;
    }
    $pageLoading--;
  }
</script>

{#if collapsed[id]}
  <div class="set-item">
    <div class="indicator-collapsed" on:click={toggleCollapsed}>
      <Icon data={faCaretRight} {scale} />
    </div>
    <div class="info-collapsed">
      <span>{source.language_name} <a href={entryUrl(entry)} sveltekit:prefetch><span class="reflex"><Reflex form={reflex} /></span></a></span>{#if senses.length && senses[0].glosses.length}<span>&nbsp;{summaryGlosses(senses[0])}</span>{/if}<span>, origin: {originSummary()}</span>
    </div>  
  </div>
{:else}
  {#each Object.keys(promises.fulfilled).sort() as key (key)}
    {#await promises.fulfilled[key] catch { message }}
      <Alert type="error" {message} />
    {/await}
  {/each}
  <div class="set-item" transition:slide={{ duration: 200 }}>
    <div class="indicator" on:click={toggleCollapsed}>
      <Icon data={faCaretDown} {scale} />
    </div>
    <div class="set-item-label">
      <p>
        <span>{source.language_name} </span><a href={entryUrl(entry)} sveltekit:prefetch><span class="reflex"><Reflex form={reflex} /></span></a>
      </p>
      <p>
        {source.reference}
      </p>
    </div>
    <ul class="details">
      {#if senses.length === 1}
        <li>
          <span>Glosses:</span>
          <span class="indent">{#if senses[0].pos}<em>{mungePos(senses[0].pos)}</em>. {/if}{glosses(senses[0])}</span>
        </li>
      {:else}
        {#each entry.senses as sense, i (sense.id)}
          <li>
            <span>Sense {i + 1}:</span>
            <span class="indent">{#if sense.pos}<em>{mungePos(sense.pos)}</em>. {/if}{glosses(sense)}</span>
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
          <span>{originSummary()}</span>
        {/if}
      </li>
      {#if member.origin === 'borrowed' && editable}
        <li transition:slide|local>
          <span></span>
          <span class="originlang">
            <span class="label">Language:</span>
            <SvelecteLanguage
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
      <div class="delete" on:click={handleDelete}>
        <Icon data={faTrash} />
      </div>
    {/if}
  </div>
{/if}

<style lang="scss">
  .indicator, .indicator-collapsed {
    inline-size: 2em;
  }

  .indicator :global(.fa-icon) {
    vertical-align: top;
    margin: 0;
    position: relative;
    top: -0.24em;
  }

  .info-collapsed {
    align-self: center;
    > :first-child {
      font-weight: bold;
    }
  }

  .details {
    flex-grow: 1;
  }

  .delete {
    position: absolute;
    right: 0;
    top: 0;
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
    padding-inline-start: 1em;
    text-indent: -1em;
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

    :global(.svelecte-control) {
      inline-size: 16em;
    }
  }

  .reflex {
    font-weight: normal;
    font-style: italic;
  }
</style>
