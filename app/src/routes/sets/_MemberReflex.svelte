<script>
  import Icon from 'svelte-awesome';
  import Reflex from '$components/Reflex.svelte';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  import { faEdit } from '@fortawesome/free-solid-svg-icons';
  import { normalizeParam } from '$lib/util';
  import { tick } from 'svelte';

  export let form;
  export let entry;
  export let href;
  export let editable = false;

  let editing = false;
  let editSpanRef;

  async function handleClick() {
    editing = true;
    await tick();
    editSpanRef.focus();
  }

  function handleKeyDown(e) {
    if (e.keyCode === 13) { // enter
      e.preventDefault();
      save();
    } else if (e.keyCode === 27) { // esc
      e.preventDefault();
      editing = false;
    }
  }

  function save() {
    const newForm = normalizeParam(editSpanRef.textContent);
    form = newForm === deriveForm(null) ? null : newForm;
    dispatch('change');
    editing = false;
  }

  function deriveForm(form) {
    return form ?? entry.headword;
  }
</script>

{#if editing}
  <span
    class="reflex"
    contenteditable="true"
    bind:this={editSpanRef}
    on:blur={() => editing && save()}
    on:keydown={handleKeyDown}
  >{deriveForm(form)}</span>
{:else}
  <a {href} sveltekit:prefetch><span class="reflex"><Reflex form={deriveForm(form)} space={true} /></span></a>{#if editable}<span on:click={handleClick}><Icon data={faEdit} /></span>{/if}
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
</style>