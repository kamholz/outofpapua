<script context="module">
  import * as suggest from '$actions/suggest';

  export async function load({ fetch, page: { params }, session }) {
    const props = {
      editable: session.user !== null,
    };
    const res = await fetch(`/api/set/${params.id}.json`);
    if (!res.ok) {
      return { status: 500, error: 'Internal error' };
    }
    props.set = await res.json();
    if (props.editable) {
      props.borrowlangSuggest = await suggest.borrowlang(fetch);
      if (!props.borrowlangSuggest) {
        return { status: 500, error: 'Internal error' };
      }
    }
    return { props };
  }
</script>

<script>
  import Alert from '$components/Alert.svelte';
  import Member from './_Member.svelte';
  import Select from './_Select.svelte';
  import { normalizeParam } from '$lib/util';
  import { pageLoading } from '$stores';
  import { setContext } from 'svelte';

  export let set;
  export let editable;
  export let borrowlangSuggest = null;
  const { members } = set;
  const values = {
    note: set.note,
  };
  const promises = { pending: {}, fulfilled: {} };
  const collapsed = Object.fromEntries(
    members.map((member) => [member.entry.id, false])
  );

  setContext('props', { set, editable, borrowlangSuggest });

  function collapseAll(state) {
    for (const member of members) {
      if (collapsed[member.entry.id] !== state) {
        collapsed[member.entry.id] = state;
      }
    }
  }

  async function handleNoteUpdate() {
    values.note = normalizeParam(values.note);
    if (set.note === values.note) {
      return;
    }
    $pageLoading++;
    let promise;
    try {
      promise = sendNoteUpdate();
      promises.pending.note = promise;
      await promise;
      set.note = values.note;
    } catch (e) {
      values.note = set.note;
    }
    if (promise && promise === promises.pending.note) { // handle race condition (unlikely)
      promises.pending.note = null;
      promises.fulfilled.note = promise;
    }
    $pageLoading--;
  }

  async function sendNoteUpdate() {
    const res = await fetch(`/api/set/${set.id}.json`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ note: values.note }),
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

<h2>Set {set.id}</h2>

<div class="set">
  {#each Object.keys(promises.fulfilled).sort() as key (key)}
    {#await promises.fulfilled[key] catch { message }}
      <Alert type="error" {message} />
    {/await}
  {/each}
  {#if editable || set.note}
    <div class="item">
      <div class="label notes">Notes:</div>
      {#if editable}
        <textarea
          name="note"
          disabled={promises.pending.note}
          bind:value={values.note}
          on:change={() => handleNoteUpdate('note')}
        />
      {:else}
        <span>{set.note}</span>
      {/if}  
    </div>
    <hr>
  {/if}  

  <div>
    <button on:click={() => collapseAll(true)}>Collapse All</button>
    <button on:click={() => collapseAll(false)}>Expand All</button>
  </div>
  <hr>

  <!--Select /-->

  {#each members as member (member.entry.id)}
    <Member {member} {collapsed} />
    <hr>
  {/each}
</div>

<style lang="scss">
  .set {
    button {
      margin-inline-start: 0;
      margin-inline-end: 10px;
    }

    textarea {
      inline-size: 100%;
      block-size: 4em;
    }

    :global(.item) {
      display: flex;
      position: relative;

      :global(.fa-icon:hover) {
        color: gray;
      }

      :global(.label) {
        flex-shrink: 0;
        inline-size: 10em;
        margin-inline-end: 12px;
        font-weight: bold;
      }
      
      :global(.label.notes) {
        inline-size: 4em;
      }
    }

    hr {
      margin-block: 20px;
      block-size: 2px;
      background-color: black;
      border: none;
    }
  }
</style>
