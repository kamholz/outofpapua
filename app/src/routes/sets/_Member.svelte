<script>
  import Glosses from './_Glosses.svelte';
  import { getContext } from 'svelte';
  const editable = getContext('editable');

  export let member;
  const { entry, source } = member;
  const { senses } = entry;
  const values = {
    origin: member.origin,
    note: member.note,
  };
</script>

<div class="item">
  <div class="label">
    <p>
      {source.language_name} <a href="/records/{entry.record_id}"><em>{entry.headword}</em></a>
    </p>
    <p>
      {source.reference}
    </p>
  </div>
  <ul>
    {#if entry.pos}
      <li>
        <span>POS:</span>
        <span>{entry.pos}</span>
      </li>
    {/if}
    {#if senses.length === 1}
      <li>
        <span>Glosses:</span>
        <span class="indent"><Glosses sense={senses[0]} /> this is a bunch more text to see what's going on with the indent and whether it works right or works wrong</span>  
      </li>
    {:else}
      {#each entry.senses as sense, i (sense.id)}
        <li>
          <span>Sense {i+1}:</span>
          <span class="indent"><Glosses {sense} /></span>  
        </li>
      {/each}
    {/if}
    <li>
      <span>Origin:</span>
      {#if editable}
        <span class="radios">
          <label>
            <input type="radio" name="origin_{member.entry_id}" value="inherited" bind:group={values.origin}>
            inherited
          </label>
          <label>
            <input type="radio" name="origin_{member.entry_id}" value="borrowed" bind:group={values.origin}>
            borrowed
          </label>
          <label>
            <input type="radio" name="origin_{member.entry_id}" value={null} bind:group={values.origin}>
            unknown
          </label>
        </span>
      {:else}
        <span>{values.origin ?? 'unknown'}</span>
      {/if}
    </li>
    {#if editable}
      <li>
        <span>Notes:</span>
        <textarea name="note_{member.entry_id}" bind:value={values.note} />
      </li>
    {:else if values.note}
      <li>
        <span>Notes:</span>
        <span>{values.note}</span>
      </li>
    {/if}
  </ul>
</div>

<style lang="scss">
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
</style>
