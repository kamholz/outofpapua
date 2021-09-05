<script>
  import 'leaflet/dist/leaflet.css';
  import 'leaflet.fullscreen/Control.FullScreen.css';
  import baseMaps from '$lib/basemaps.json';
  import { escapeHtml as escape } from '$lib/util';
  import { onDestroy, onMount } from 'svelte';

  export let languages;
  export let families;
  export let markerType;
  export let includeLanguageOnLabel;
  export let baseMap;
  export let lineLength;
  const languagesById = Object.fromEntries(languages.map((obj) => [obj.language.id, obj]));

  let L;
  let map;
  let layer;

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

  $: updateLabels(markerType, includeLanguageOnLabel, lineLength);

  onMount(async () => {
    await loadLeaflet();

    map = L.map('map', {
      // closePopupOnClick: false,
      fullscreenControl: true,
      maxZoom: 13,
      scrollWheelZoom: false,
      zoomDelta: 0.5,
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
      await import('leaflet.fullscreen');
    }
    ({ L } = window);
  }

  function initializeMap() {
    initializeMarkers();
    if (markerType === 'point-label') {
      L.tooltipLayout.initialize(map, (ply) => {
        ply.setStyle({
          color: '#999',
          weight: 2,
        });
      });
    }
  }

  function initializeMarkers() {
    for (const obj of languages.filter(({ selection }) => selection.language)) {
      removeMarker(obj.marker);
      obj.marker = createMarker(obj);
    }
    if (markerType === 'point-label') {
      L.tooltipLayout.setLineLength(lineLength);
    }
  }

  function createMarker(obj) {
    const marker = L.marker(obj.language.location, {
      icon: getIcon(obj),
    }).addTo(map);
    if (markerType === 'point-label') {
      marker.bindTooltip(getSummaryHtml(obj), {
        className: `marker ${obj.originClass}`,
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

  export function updateLanguage(id, skipRedraw) {
    const obj = languagesById[id];
    removeMarker(obj.marker);
    if (obj.selection.language) {
      obj.marker = createMarker(obj);
    } else {
      obj.marker = null;
    }
    if (!skipRedraw && markerType === 'point-label') {
      L.tooltipLayout.redrawLines();
    }
  }

  export function updateFamily(id) {
    for (const { language } of languages) {
      if (language.ancestor_id === id) {
        updateLanguage(language.id, true);
      }
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

  function getIcon(obj) {
    const { language, originClass } = obj;
    if (markerType === 'label') {
      return L.divIcon({
        html: getSummaryHtml(obj, includeLanguageOnLabel),
        className: `marker ${originClass}`,
        iconSize: null,
      });
    } else {
      return L.divIcon({
        html: `<svg class="svg ${originClass}" viewBox="0 0 16 16"><use href="/icons.svg#${families[language.ancestor_id].shape}" /></svg>`,
        iconSize: null,
      });
    }
  }

  function getSummaryHtml(obj) {
    const { headwords, language, selection } = obj;
    const html = headwords
      .filter((headword) => selection.headwords[headword])
      .map((headword) => `<em>${escape(headword)}</em>`).join(', ');
    return includeLanguageOnLabel ? (escape(language.name) + ' ' + html) : html;
  }

  function getOriginClass(entries) {
    const origins = new Set(entries.map((v) => v.origin).filter((v) => v));
    if (origins.size === 1) {
      const [singleOrigin] = [...origins];
      if (singleOrigin) {
        return singleOrigin;
      }
    }
    return 'unknown';
  }
</script>

<div id="map"></div>

<style lang="scss">
  $borrowed: rgba(220, 20, 60, 0.75);
  $inherited: rgba(128, 0, 128, 0.75);
  $unknown_black: rgba(0, 0, 0, 0.75);
  $unknown_white: rgba(255, 255, 255, 0.75);

  div {
    width: 100%;
    height: 600px;

    :global {
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

      .svg {
        width: 12px;
        height: 12px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .marker.borrowed {
        background-color: $borrowed;
      }
      .svg.borrowed {
        color: $borrowed;
      }

      .marker.inherited {
        background-color: $inherited;
      }
      .svg.inherited {
        color: $inherited;
      }

      .marker.unknown {
        color: black;
        background-color: $unknown_white;
      }
      .svg.unknown {
        color: $unknown_black;
      }

      .leaflet-tooltip-top:before,
      .leaflet-tooltip-bottom:before,
      .leaflet-tooltip-left:before,
      .leaflet-tooltip-right:before {
        border: none;
      }

      .leaflet-div-icon {
        background: unset;
        border: unset;
      }
    }
  }
</style>