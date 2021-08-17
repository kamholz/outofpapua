<script context="module">
  export async function load({ fetch, page: { params } }) {
    const props = {};

    props.set = await reload(fetch, Number(params.id));
    if (!props.set) {
      return { status: 404 };
    }

    return { props };
  }

  async function reload(fetch, id) {
    const res = await fetch(`/api/set/${id}.json`);
    return res.ok ? res.json() : null;
  }
</script>

<script>
  import { browser } from '$app/env';
  import { escapeHtml as escape } from '$lib/util';
  import { glossSummaryNoLanguage, parseLanguageLocation } from '$lib/util';
  import { onMount } from 'svelte';
  import 'leaflet/dist/leaflet.css';

  export let set;
  const members = set.members.filter((v) => v.language.location);
  const languages = getLanguages();

  if (browser) {
    onMount(async () => {
      const L = await import('leaflet');
      await import('$lib/leaflet-svg-icon');

      const map = L.map('map').fitBounds(getBounds());

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        tileSize: 256,
      }).addTo(map);

      for (const { language, members } of languages) {
        const color = getColor(members);
        L.marker.svgMarker(language.location, {
          iconOptions: {
            circleRatio: 0,
            color,
            iconSize: [24,32],
          }
        })
        .addTo(map)
        .bindPopup(getPopupHtml(language, members));
      }
    });
  }

  function getLanguages() {
    const membersByLanguageCode = {};
    for (const member of members) {
      const id = member.language.id;
      if (!(id in membersByLanguageCode)) {
        const item = membersByLanguageCode[id] = {
          language: member.language,
          members: [member],
        };
        parseLanguageLocation(item.language);
      } else {
        membersByLanguageCode[id].members.push(member);
      }
    }
    return Object.values(membersByLanguageCode);
  }

  function getBounds() {
    const locations = languages.map(({ language }) => language.location);
    return [
      [
        Math.min(...locations.map((v) => v[0])),
        Math.min(...locations.map((v) => v[1]))
      ],
      [
        Math.max(...locations.map((v) => v[0])),
        Math.max(...locations.map((v) => v[1]))
      ]
    ];
  }

  function getPopupHtml(language, members) {
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
      const origin = [...origins][0];
      if (origin === 'borrowed') {
        return 'crimson';
      } else if (origin === 'inherited') {
        return 'purple';
      }
    }
    return 'black';
  }
</script>

 <div id="map"></div>

 <style>
  div {
    height: 500px;
  }
 </style>