<script>
  import Reflex from '$components/Reflex.svelte';
  import { createPopperActions, popover } from '$lib/popover';
  import { fade } from 'svelte/transition';
  import { getContext } from 'svelte';
  import { glossSummaryNoLanguage } from '$lib/util';

  export let href;
  export let id;
  const cache = getContext('setSummaryCache');
  $: set = $cache[id];

  const [popperRef, popperContent] = createPopperActions();
  let showPopover = false;

  async function fetchSet() {
    if (!set) {
      const res = await fetch(`/api/set/${id}.json`);
      if (res.ok) {
        $cache[id] = await res.json();
      }
    }
  }
</script>

<a
  {href}
  sveltekit:prefetch
  use:popover={{
    popperRef,
    activate: 'hover',
    show: () => showPopover = true,
    hide: () => showPopover = false,
    prefetch: fetchSet,
  }}
>
  <slot />
</a>
{#if showPopover && set}
  <div class="popover" use:popperContent transition:fade|local={{ duration: 200 }}>
    <div class="title">Set: {set.title ?? set.id}</div>
    <ul>
      {#each set.members as { entry, reflex, source } (entry.id)}
        <li><span class:borrowed={entry.origin === 'borrowed'} class:inherited={entry.origin === 'inherited'}>{source.language_name} <Reflex form={reflex ?? entry.headword} space={false} /></span> {#if entry.senses[0]?.glosses?.[0]}{glossSummaryNoLanguage(entry.senses[0].glosses[0])}{/if}</li>
      {/each}
    </ul>
  </div>
{/if}

<style lang="scss">
  .popover {
    padding: 8px;
    @include popover;
  }

  .title {
    font-style: italic;
    margin-block-end: 4px;
  }
</style>