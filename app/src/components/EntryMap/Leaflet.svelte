<script>
  import 'leaflet/dist/leaflet.css';
  import { escapeHtml as escape } from '$lib/util';
  import { getContext, onDestroy, onMount } from 'svelte';

  export let languages;
  export let markerType;
  export let includeLanguageOnLabel;
  export let baseMap;
  const languagesById = Object.fromEntries(languages.map((obj) => [obj.language.id, obj]));
  const selection = getContext('selection');

  let L;
  let map;
  let layer;

  const baseMaps = {
    'esri-shaded-relief': {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri',
    },
    'esri-topo': {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
    },
  };

  for (const obj of languages) {
    obj.originClass = getOriginClass(obj.entries);
  }

  $: if (map && baseMap) {
    layer?.remove();
    layer = L.tileLayer(baseMaps[baseMap].url, {
      attribution: baseMaps[baseMap].attribution,
      // tileSize: 256,
    }).addTo(map);
  }

  $: updateLabels(markerType, includeLanguageOnLabel);

  onMount(async () => {
    await loadLeaflet();

    map = L.map('map', {
      closePopupOnClick: false,
      maxZoom: 11,
      scrollWheelZoom: false,
      // zoomDelta: 0.5,
      zoomSnap: 0.5,
    })
    .fitBounds(getBounds(languages));

    initializeMap();
  });

  onDestroy(() => {
    map?.remove();
  });

  async function loadLeaflet() {
    if (!window.L) {
      await import('leaflet');
      await import('leaflet-tooltip-layout');
    }
    ({ L } = window);
  }

  function initializeMap() {
    initializeMarkers();
    if (markerType === 'point-label') {
      L.tooltipLayout.initialize(map);
    }
  }

  function initializeMarkers() {
    for (const obj of languages.filter(({ language }) => selection[language.id])) {
      removeMarker(obj.marker);
      obj.marker = createMarker(obj);
    }
  }

  function createMarker(obj) {
    const { headwords, language, originClass } = obj;
    const marker = L.marker(language.location, {
      icon: getIcon(headwords, language, includeLanguageOnLabel, originClass)
    }).addTo(map);
    if (markerType === 'point-label') {
      marker.bindTooltip(getSummaryHtml(headwords, language, includeLanguageOnLabel), {
        className: `marker ${originClass}`,
      });
      L.tooltipLayout.resetMarker(marker);
    }
    return marker;
  }

  function removeMarker(marker) {
    if (marker) {
      marker.remove();
      L.tooltipLayout.deleteMarker(marker);
    }
  }

  export function updateLanguage(id) {
    const obj = languagesById[id];
    removeMarker(obj.marker);
    if (selection[id].language) {
      obj.marker = createMarker(obj);
    } else {
      obj.marker = null;
    }
    if (markerType === 'point-label') {
      L.tooltipLayout.redrawLines();
    }
  }

  function updateLabels() {
    if (map) {
      initializeMarkers();
      L.tooltipLayout.redrawLines();
    }
  }

  function getBounds(languages) {
    const locations = languages.map(({ language }) => language.location);
    return [
      [
        Math.min(...locations.map((v) => v[0])),
        Math.min(...locations.map((v) => v[1])),
      ],
      [
        Math.max(...locations.map((v) => v[0])),
        Math.max(...locations.map((v) => v[1])),
      ],
    ];
  }

  function getIcon(headwords, language, includeLanguageOnIcon, originClass) {
    if (markerType === 'label') {
      return L.divIcon({
        html: getSummaryHtml(headwords, language, includeLanguageOnIcon),
        className: `marker ${originClass}`,
        iconSize: null,
      });
    } else {
      return L.divIcon({
        className: `circle ${originClass}`,
        iconSize: [8, 8],
      });
    }
  }

  function getSummaryHtml(headwords, language, includeLanguageOnIcon) {
    const html = headwords
      .filter((headword) => selection[language.id].headwords[headword])
      .map((headword) => `<em>${escape(headword)}</em>`).join(', ');
    return includeLanguageOnIcon ? (escape(language.name) + ' ' + html) : html;
  }

  function getOriginClass(entries) {
    const origins = new Set(entries.map((v) => v.origin).filter((v) => v));
    if (origins.size === 1) {
      const [singleOrigin] = [...origins];
      if (singleOrigin) {
        return `marker-${singleOrigin}`;
      }
    }
    return 'marker-unknown';
  }
</script>

<div id="map"></div>

<style lang="scss">
  div {
    width: 100%;
    height: 600px;

    :global {
      .circle {
        border-radius: 50%;
      }

      .marker {
        padding: 6px;
        width: max-content;
        max-width: 12em;
        color: white;
        line-height: 1.25;
        border: transparent;
        border-radius: 6px;
        white-space: unset;
      }

      .marker-borrowed {
        background-color: rgba(220, 20, 60, 0.75);
      }

      .marker-inherited {
        background-color: rgba(128, 0, 128, 0.75);
      }

      .marker-unknown {
        background-color: rgba(0, 0, 0, 0.75);
      }

      .leaflet-tooltip-top:before,
      .leaflet-tooltip-bottom:before,
      .leaflet-tooltip-left:before,
      .leaflet-tooltip-right:before {
        border: none;
      }
    }
  }
</style>