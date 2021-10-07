<script>
  import Icon from 'svelte-awesome';
  import Reflex from '$components/Reflex.svelte';
  import { createPopover, popoverContent, popoverTrigger } from '$lib/popover';
  import { faBezierCurve } from '@fortawesome/free-solid-svg-icons';
  import { fade } from 'svelte/transition';
  import { getContext } from 'svelte';
  import { glossSummaryNoLanguage } from '$lib/util';

  export let id;
  const cache = getContext('setSummaryCache');
  $: set = $cache[id];

  let showPopover = false;
  const popover = createPopover({
    hover: true,
    show: () => showPopover = true,
    hide: () => showPopover = false,
    prefetch: fetchSet,
  });

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
  href="/sets/{id}"
  sveltekit:prefetch
  use:popoverTrigger={popover}
>
  <slot>
    <Icon data={faBezierCurve} />
  </slot>
</a>
{#if showPopover && set}
  <div
    class="popover"
    use:popoverContent={popover}
    transition:fade|local={{ duration: 200 }}
  >
    <div class="title">Set: {set.name_auto.txt}</div>
    <ul>
      {#each set.members as { entry, language, reflex } (entry.id)}
        <li><span class={entry.origin}>{language.name} <Reflex {reflex} headword={entry.headword} space={false} /></span> {#if entry.senses[0]?.glosses?.[0]}{glossSummaryNoLanguage(entry.senses[0].glosses[0])}{/if}</li>
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