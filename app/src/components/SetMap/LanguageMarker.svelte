<script>
  import { escapeHtml as escape, sortFunction } from '$lib/util';
  import { onDestroy } from 'svelte';

  export let L;
  export let map;
  export let language;
  export let members;
  export let includeLanguageOnIcon;

  $: classes = getClasses(members);

  $: icon = L.divIcon({
    html: getSummaryHtml(members, language, includeLanguageOnIcon),
    className: classes,
    iconSize: null
  });

  $: marker = L.marker(language.location).addTo(map);
  $: marker.setIcon(icon);
  $: {
    if (includeLanguageOnIcon) {
      marker.unbindTooltip();
    } else {
      marker.bindTooltip(escape(language.name));
    }
  }

  onDestroy(() => {
    marker.remove();
  });

  function getSummaryHtml(members, language, includeLanguageOnIcon) {
    const headwords = [...new Set(members.map(({ entry }) => entry.headword))]
      .sort(sortFunction((v) => v.toLowerCase()));
    if (includeLanguageOnIcon) {
      return headwords.map((v) => `${escape(language.name)} <em>${escape(v)}</em>`).join(', ');    
    } else {
      return headwords.map((v) => `<em>${escape(v)}</em>`).join(', ');    
    }
  }

  function getClasses(members) {
    const classes = ['marker'];
    let origin = 'unknown';
    const origins = new Set(members.map((v) => v.entry.origin).filter((v) => v));
    if (origins.size === 1) {
      let [singleOrigin] = [...origins];
      if (singleOrigin) {
        origin = singleOrigin;
      }
    }
    classes.push(`marker-${origin}`);
    return classes.join(' ');
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