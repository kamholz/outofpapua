<script>
  import Glosses from './_Glosses.svelte';
  import Radios from './_Radios.svelte';
  import { getContext } from 'svelte';
  const editable = getContext('editable');

  export let member;
  const { entry, source } = member;
  const { senses } = entry;
  const values = {
    inherited: member.inherited,
    borrowed: member.borrowed,
    note: member.note,
  };

  function handleClick(type) {
    const opposite = type === 'inherited' ? 'borrowed' : 'inherited';
    return function () {
      if (values[type] === true && values[opposite] === true) {
        values[opposite] = false;
      }
    }
  }
</script>

<div class="item">
  <span class="label">
    <a href="/records/{entry.record_id}">{source.language_name} <em>{entry.headword}</em></a>
  </span>
  <ul>
    {#if entry.pos}
      <li>
        <span class="memberlabel">POS:</span>
        <span>{entry.pos}</span>
      </li>
    {/if}
    {#if senses.length === 1}
      <li>
        <span class="memberlabel">Glosses:</span>
        <span class="indent"><Glosses sense={senses[0]} /> this is a bunch more text to see what's going on with the indent and whether it works right or works wrong</span>  
      </li>
    {:else}
      {#each entry.senses as sense, i (sense.id)}
        <li>
          <span class="memberlabel">Sense {i+1}:</span>
          <span class="indent"><Glosses {sense} /></span>  
        </li>
      {/each}
    {/if}
    <Radios
      name="inherited_{member.entry_id}"
      label="Inherited" 
      bind:value={values.inherited}
      on:click={handleClick('inherited')}
    />
    <Radios
      name="borrowed_{member.entry_id}"
      label="Borrowed"
      bind:value={values.borrowed}
      on:click={handleClick('borrowed')} 
    />
    {#if editable}
      <li>
        <span class="memberlabel">Notes:</span><textarea name="note_{member.entry_id}" bind:value={values.note} />
      </li>
    {:else if values.note}
      <li>
        <span class="memberlabel">Notes:</span><span>{values.note}</span>
      </li>
    {/if}
  </ul>
</div>

<style lang="scss">
  ul {
    textarea {
        inline-size: 20em;
    }

    :global(li) {
      display: flex;

      :global(.memberlabel) {
        flex-shrink: 0;
        inline-size: 6em;
        align-self: top;
      }

      :global(.indent) {
        padding-inline-start: 1em;
        text-indent: -1em;
      }

      &:not(:last-child) {
        margin-block-end: 12px;
      }
    }
  }
</style>
