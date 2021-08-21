<script>
  import { escapeHtml as escape, sortFunction } from '$lib/util';
  import { onDestroy } from 'svelte';

  export let L;
  export let map;
  export let language;
  export let members;

  const classes = ['marker'];
  addOriginClass(members, classes);

  const icon = L.divIcon({
    html: getSummaryHtml(members),
    className: classes.join(' '),
    iconSize: null
  });

  const marker = L.marker(language.location, { icon })
    .addTo(map)
    .bindTooltip(escape(language.name));

  onDestroy(() => {
    marker.remove();
  });

  function getSummaryHtml(members) {
    const headwords = new Set(members.map(({ entry }) => entry.headword));
    return [...headwords]
      .sort(sortFunction((v) => v.toLowerCase()))
      .map((v) => escape(v))
      .join(', ');
  }

  function addOriginClass(members, classes) {
    let origin = 'unknown';
    const origins = new Set(members.map((v) => v.entry.origin).filter((v) => v));
    if (origins.size === 1) {
      let [singleOrigin] = [...origins];
      if (singleOrigin) {
        origin = singleOrigin;
      }
    }
    classes.push(`marker-${origin}`);
  }
</script>

<style global>
  .marker {
    color: white;
    line-height: 1.25;
    padding: 6px;
    border: 1px solid black;
    border-radius: 6px;
    width: max-content;
    max-width: 10em;
  }

  .marker-borrowed {
    background-color: crimson;
  }

  .marker-inherited {
    background-color: purple;
  }

  .marker-unknown {
    background-color: black;
  }
</style>