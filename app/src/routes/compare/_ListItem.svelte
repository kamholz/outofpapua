<script>
  import Collapsible from '$components/Collapsible.svelte';
  import CollapsibleIndicator from '$components/CollapsibleIndicator.svelte';
  import EntryLink from '$components/EntryLink.svelte';
  import Icon from 'svelte-awesome';
  import Senses from '$components/Senses.svelte';
  import SetPopover from '$components/SetPopover.svelte';
  import { faBezierCurve } from '@fortawesome/free-solid-svg-icons';
  import { slide } from 'svelte/transition';

  export let entry;
  export let lang2;
  export let collapsed;
  export let multilang;
  const { compare_entries, headword, senses } = entry;
</script>

<div class="entry">
  <EntryLink {entry}><strong class={entry.origin}>{headword}</strong></EntryLink>
  {#if entry.set_id}
    <SetPopover id={entry.set_id}>
      <Icon data={faBezierCurve} />
    </SetPopover>
  {/if}
  <div>
    <Senses {senses} {multilang} />
  </div>
</div>
{#if compare_entries}
  <Collapsible {collapsed}>
    <div class="header">
      <CollapsibleIndicator />
      {lang2.name} comparisons
    </div>
    {#if !$collapsed}
      <ul transition:slide|local={{ duration: 200 }}>
        {#each compare_entries as compare_entry (compare_entry.id)}
          <li>
            <EntryLink {entry}><strong class={compare_entry.origin}>{compare_entry.headword}</strong></EntryLink>
            {#if compare_entry.set_id}
              <SetPopover id={compare_entry.set_id}>
                <Icon data={faBezierCurve} />
              </SetPopover>
            {/if}
            <div>
              <Senses senses={compare_entry.senses} {multilang} />
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </Collapsible>
{/if}

<style lang="scss">
  .entry {
    display: flex;
    > div {
      margin-inline-start: 12px;
    }
    // :global(> :first-child) {
    //   @include indent-small;
    // }
  }

  .header {
    display: flex;
    margin-block: 12px 6px;
  }

  ul {
    margin-inline-start: 1em;
    li {
      display: flex;
      margin-block-start: 6px;
      > div {
        margin-inline-start: 12px;
      }
      // :global(> :first-child) {
      //   @include indent-small;
      // }
    }
  }
</style>