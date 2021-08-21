<script>
  import { escapeHtml as escape, glossSummaryNoLanguage } from '$lib/util';
  import { onDestroy } from 'svelte';

  export let L;
  export let map;
  export let language;
  export let members;

  const classes = ['marker'];
  addOriginClass(members, classes);

  const icon = L.divIcon({
    html: getSummaryHtml(language, members),
    className: classes.join(' ')
  });

  const marker = L.marker(language.location, { icon }).addTo(map);

  onDestroy(() => {
    marker.remove();
  });

  function getSummaryHtml(language, members) {
    let html = `${escape(language.name)} `;
    const membersHtml = members.map(({ entry }) => `<em>${escape(entry.headword)}</em>`);
    html += membersHtml.join(', ');
    // if (entry.senses[0]?.glosses?.[0]) {
    //   html += ' ' + escape(glossSummaryNoLanguage(entry.senses[0].glosses[0]));
    // }
    return html;
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
    width: unset !important;
    height: unset !important;
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