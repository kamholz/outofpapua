<script>
  import Alert from '$components/Alert.svelte';
  import Icon from 'svelte-awesome';
  import Svelecte from '$lib/svelecte';
  import { faCaretRight, faCaretDown } from '@fortawesome/free-solid-svg-icons';
  import { getContext } from 'svelte';
  import { normalizeParam } from '$lib/util';
  import { pageLoading } from '$stores';
  import { slide, fly } from 'svelte/transition';

  export let member;
  export let collapsed = false;
  const scale = 1.5;
  let promises = { pending: {}, fulfilled: {} };
  
  const { entry, source } = member;
  const { senses } = entry;
  const { set, editable, borrowlangSuggest } = getContext('props');
  const values = {
    note: member.note,
    origin: member.origin,
    origin_language_id: member.origin_language_id,
    origin_language_name: member.origin_language_name,
  };
  const options = [...borrowlangSuggest].filter((v) => v.id !== source.language_id);

  function toggleCollapsed() {
    collapsed = !collapsed;
  }

  function originSummary() {
    let origin = values.origin ?? 'unknown';
    if (origin === 'borrowed' && values.origin_language_name) {
      origin += ` from ${values.origin_language_name}`;
    }
    return origin;
  }

  function glosses(sense) {
    return sense.glosses.map(({ language, txt }) =>
      `‘${txt.join(', ')}’ (${language})`
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
      promise = sendUpdate(key);
      promises.pending[key] = promise;
      await promise;
      member[key] = values[key];
      if (key === 'origin' && member[key] !== 'borrowed') {
        member.origin_language_id = values.origin_language_id = null;
      }
    } catch (e) {
      values[key] = member[key];
    }
    if (promise && promise === promises.pending[key]) { // handle race condition (unlikely)
      promises.pending[key] = null;
      promises.fulfilled[key] = promise;
    }
    $pageLoading--;
  }

  async function sendUpdate(key) {
    const res = await fetch(`/api/set/${set.id}/member/${entry.id}.json`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ [key]: values[key] }),
    });
    if (!res.ok) {
      if (res.status === 400) {
        throw new Error('Could not update: ' + (await res.json()).error);
      } else {
        throw new Error('Could not update');
      }
    }
  }
</script>

{#if collapsed}
  <div class="item">
    <div class="indicator-collapsed" on:click={toggleCollapsed}>
      <Icon data={faCaretRight} {scale} />
    </div>
    <div class="info-collapsed">
      <span>{source.language_name} <a href="/records/{entry.record_id}" sveltekit:prefetch><em>{entry.headword}</em></a></span>{#if senses.length && senses[0].glosses.length}<span>&nbsp;{summaryGlosses(senses[0])}</span>{/if}<span>, origin: {originSummary()}</span>
    </div>  
  </div>
{:else}
  {#each Object.keys(promises.fulfilled).sort() as key (key)}
    {#await promises.fulfilled[key] catch { message }}
      <Alert type="error" {message} />
    {/await}
  {/each}
  <div class="item" transition:slide|local={{ duration: 200 }}>
    <div class="indicator" on:click={toggleCollapsed}>
      <Icon data={faCaretDown} {scale} />
    </div>
    <div class="label">
      <p>
        <span>{source.language_name} </span><a href="/records/{entry.record_id}" sveltekit:prefetch><em>{entry.headword}</em></a>
      </p>
      <p>
        {source.reference}
      </p>
    </div>
    <ul>
      {#if senses.length === 1}
        <li>
          <span>Glosses:</span>
          <span class="indent">{glosses(senses[0])}</span>
        </li>
      {:else}
        {#each entry.senses as sense, i (sense.id)}
          <li>
            <span>Sense {i + 1}:</span>
            <span class="indent">{glosses(sense)}</span>
          </li>
        {/each}
      {/if}
      {#if entry.pos}
        <li>
          <span>POS:</span>
          <span>{entry.pos}</span>
        </li>
      {/if}
      <li>
        <span>Origin:</span>
        {#if editable}
          <span class="radios">
            <label>
              <input
                type="radio"
                name="origin_{entry.id}"
                value="inherited"
                disabled={promises.pending.origin}
                bind:group={values.origin}
                on:change={() => handleUpdate('origin')}
              >
              inherited
            </label>
            <label>
              <input
                type="radio"
                name="origin_{entry.id}"
                value="borrowed"
                disabled={promises.pending.origin}
                bind:group={values.origin}
                on:change={() => handleUpdate('origin')}
              >
              borrowed
            </label>
            <label>
              <input
                type="radio"
                name="origin_{member.entry_id}"
                value={null}
                disabled={promises.pending.origin}
                bind:group={values.origin}
                on:change={() => handleUpdate('origin')}
              >
              unknown
            </label>
          </span>
        {:else}
          <span>{originSummary()}</span>
        {/if}
      </li>
      {#if member.origin === 'borrowed' && editable}
        <li transition:slide|local>
          <span></span>
          <span class="autocomplete">
            <span class="autocomplete-label">Language:</span>
            <Svelecte
              {options}
              labelField="name"
              searchField="name"
              valueField="id"
              clearable
              searchable
              placeholder=""
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
            name="note_{member.entry_id}"
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
  </div>
{/if}

<style lang="scss">
  .indicator, .indicator-collapsed {
    flex-shrink: 0;
    inline-size: 2em;

    :global(.fa-icon:hover) {
      color: gray;
    }
  }

  :global(.indicator .fa-icon) {
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

  li {
    display: flex;

    &:not(:last-child) {
      margin-block-end: 12px;
    }

    > :first-child {
      flex-shrink: 0;
      inline-size: 6em;
      align-self: top;
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
    label, input {
      vertical-align: middle;
    }
    label {
      margin-inline-end: 8px; 
    }
    input {
      margin-inline-start: 4px;
    }    
  }

  .autocomplete {
    display: flex;
    align-items: center;

    .autocomplete-label {
      margin-inline-end: 10px;
    }

    :global(.svelecte-control) {
      inline-size: 16em;
    }
  }
</style>
