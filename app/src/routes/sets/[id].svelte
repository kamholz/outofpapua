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
  import SetMember from './_Member.svelte';
  import { fade } from 'svelte/transition';
  import { normalizeParam } from '$lib/util';
  import { pageLoading } from '$stores';
  import { setContext } from 'svelte';

  export let set;
  export let editable;
  export let borrowlangSuggest = null;
  let { members } = set;
  let values = {
    note: set.note,
  };
  let note = set.note;
  let promises = { pending: {}, fulfilled: {} };

  setContext('props', { set, editable, borrowlangSuggest });

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

<div in:fade={{ duration: 200 }}>
<h2>Set {set.id}</h2>

<div class="set">
  {#each Object.keys(promises.fulfilled).sort() as key (key)}
    {#await promises.fulfilled[key] catch { message }}
      <Alert type="error" {message} />
    {/await}
  {/each}
  {#if editable || set.note}
    <div class="item">
      <div class="label">Notes:</div>
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

  {#each members as member (member.entry_id)}
    <SetMember {member} />
    <hr>
  {/each}
</div>

</div>

<style lang="scss">
  .set {
    textarea {
      inline-size: 100%;
      block-size: 4em;
    }

    :global(.item) {
      display: flex;
      justify-content: flex-start;

      :global(.label) {
        flex-shrink: 0;
        inline-size: 10em;
        margin-inline-end: 6px;
        font-weight: bold;
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
