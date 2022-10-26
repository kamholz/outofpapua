<script>
  import EntryLink from '$components/EntryLink.svelte';
  import Icon from 'svelte-awesome';
  import Reflex from '$components/Reflex.svelte';
  import keydown from '$lib/keydown';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  import { faRegistered } from '@fortawesome/free-solid-svg-icons';
  import { normalizeParam } from '$lib/util';
  import { tick } from 'svelte';

  export let reflex;
  export let entry;
  export let editable = false;

  let editing = false;
  let editSpanRef;

  async function handleClick() {
    editing = true;
    await tick();
    editSpanRef.focus();
  }

  function save() {
    const newReflex = normalizeParam(editSpanRef.textContent);
    reflex = newReflex === deriveReflex(null) ? null : newReflex;
    dispatch('change');
    editing = false;
  }

  function deriveReflex(reflex) {
    return reflex ?? entry.headword;
  }
</script>

{#if editing}
  <span
    class="reflex"
    contenteditable="true"
    bind:this={editSpanRef}
    on:blur={() => editing && save()}
    use:keydown={{ enter: save, esc: () => editing = false }}
  >{deriveReflex(reflex)}</span>
{:else}
  <EntryLink {entry}><span class="reflex {entry.origin ?? ''}"><Reflex {reflex} headword={entry.headword} /></span></EntryLink>{#if editable}<span class="icon" title="Edit reflex" on:click={handleClick}><Icon data={faRegistered} /></span>{/if}
{/if}

<style lang="scss">
  .reflex {
    font-weight: normal;
    font-style: italic;

    &[contenteditable="true"] {
      padding-inline: 4px;
      font-style: normal;
    }
  }

  .icon {
    vertical-align: middle;
  }
</style>