<script context="module">
  export async function load({ fetch, page: { params }, session }) {
    const props = {
      editable: session.user !== null,
    };
    const res = await fetch(`/api/set/${params.id}.json`);
    if (!res.ok) {
      return { status: 500, error: 'Internal error' };
    }
    props.set = await res.json();
    return { props };
  }
</script>

<script>
  import SetMember from './_Member.svelte';
  import { fade } from 'svelte/transition';
  import { setContext } from 'svelte';

  export let set;
  export let editable;
  let { members } = set;
  let note = set.note;

  setContext('editable', editable);
</script>

<div in:fade={{ duration: 200 }}>
<h2>Set {set.id}</h2>

<div class="set">
  {#if editable || set.note}
    <div class="item">
      <div class="label">Notes:</div>
      {#if editable}
        <textarea name="note" bind:value={note} />
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
