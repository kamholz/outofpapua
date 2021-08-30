<script>
  import 'leaflet/dist/leaflet.css';
  import { escapeHtml as escape } from '$lib/util';
  import { faCircle, faPlay, faSquare, faStar } from '@fortawesome/free-solid-svg-icons';
  import { getContext, onDestroy, onMount } from 'svelte';
  import { icon } from '@fortawesome/fontawesome-svg-core';

  export let languages;
  export let markerType;
  export let markerShape;
  export let includeLanguageOnLabel;
  export let baseMap;
  const languagesById = Object.fromEntries(languages.map((obj) => [obj.language.id, obj]));
  const selection = getContext('selection');

  const shape = {
    circle: faCircle,
    square: faSquare,
    star: faStar,
    triangle: faPlay,
  };

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

  $: updateLabels(markerType, markerShape, includeLanguageOnLabel);

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
        html: icon(shape[markerShape], {
          classes: ['svg', originClass],
        }).html[0],
        iconSize: null,
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
  $unknown: rgba(255, 255, 255, 0.75);

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
        background-color: $inherited;
      }
      .svg.unknown {
        color: $inherited;
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