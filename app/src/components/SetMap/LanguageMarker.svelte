<script>
  import { escapeHtml as escape, glossSummaryNoLanguage } from '$lib/util';
  import { onDestroy } from 'svelte';

  export let L;
  export let map;
  export let language;
  export let members;

  const color = getColor(members);
  const marker = L.marker.svgMarker(language.location, {
    iconOptions: {
      circleRatio: 0,
      color,
      fillOpacity: 0.5,
      iconSize: [24, 32],
    },
  })
  .addTo(map)
  .bindPopup(getSummaryHtml(language, members), {
    autoClose: false,
  });

  onDestroy(() => {
    marker.remove();
  });

  function getSummaryHtml(language, members) {
    let html = `<strong>${escape(language.name)}</strong><br>`;
    for (const { entry } of members) {
      html += '<em';
      if (entry.origin) {
        html += ` class="${entry.origin}"`;
      }
      html += `>${escape(entry.headword)}</em>`;
      if (entry.senses[0]?.glosses?.[0]) {
        html += ' ' + escape(glossSummaryNoLanguage(entry.senses[0].glosses[0]));
      }
      html += '<br>';
    }
    return html;
  }

  function getColor(members) {
    const origins = new Set(members.map((v) => v.entry.origin).filter((v) => v));
    if (origins.size === 1) {
      const [origin] = [...origins];
      if (origin === 'borrowed') {
        return 'crimson';
      } else if (origin === 'inherited') {
        return 'purple';
      }
    }
    return 'black';
  }
</script>