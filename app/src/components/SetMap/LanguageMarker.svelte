<script>
  import { escapeHtml as escape } from '$lib/util';
  import { onDestroy } from 'svelte';

  export let L;
  export let map;

  export let entries;
  export let headwords;
  export let language;
  export let includeLanguageOnIcon;

  $: classes = getClasses(entries);

  $: icon = L.divIcon({
    html: getSummaryHtml(headwords, language, includeLanguageOnIcon),
    className: classes,
    iconSize: null,
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

  function getSummaryHtml(headwords, language, includeLanguageOnIcon) {
    if (includeLanguageOnIcon) {
      return headwords.map((v) => `${escape(language.name)} <em>${escape(v)}</em>`).join(', ');
    } else {
      return headwords.map((v) => `<em>${escape(v)}</em>`).join(', ');
    }
  }

  function getClasses(entries) {
    const classes = ['marker'];
    let origin = 'unknown';
    const origins = new Set(entries.map((v) => v.origin).filter((v) => v));
    if (origins.size === 1) {
      const [singleOrigin] = [...origins];
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