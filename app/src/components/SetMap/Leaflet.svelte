<script>
  import 'leaflet.fullscreen/Control.FullScreen.css';
  import 'leaflet/dist/leaflet.css';
  import baseMaps from '$lib/basemaps.json';
  import hexAlpha from 'hex-alpha';
  import { escapeHtml as escape } from '$lib/util';
  import { onDestroy, onMount } from 'svelte';
  import { yiq } from 'yiq';

  export let languages;
  export let families;
  export let baseMap;
  export let settings;
  export let colors;
  const languagesById = Object.fromEntries(languages.map((obj) => [obj.language.id, obj]));

  let L;
  let tooltipLayout;
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

  $: updateLabels(settings);

  $: cssVars = getCssVars(colors);

  onMount(async () => {
    L = await import('leaflet');
    tooltipLayout = await import('leaflet-tooltip-layout');
    await import('leaflet.fullscreen');

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
    if (map) {
      map.remove();
      tooltipLayout.setMarkers([]);
    }
  });

  function initializeMap() {
    initializeMarkers();
    if (settings.markerType === 'point-label') {
      tooltipLayout.initialize(map, (ply) => {
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
    if (settings.markerType === 'point-label') {
      tooltipLayout.setLineLength(settings.lineLength);
    }
  }

  function createMarker(obj) {
    const marker = L.marker(obj.language.location, {
      icon: getIcon(obj),
    }).addTo(map);
    if (settings.markerType === 'point-label') {
      marker.bindTooltip(getSummaryHtml(obj), {
        className: `marker ${obj.originClass}`,
      });
      tooltipLayout.resetMarker(marker);
    }
    return marker;
  }

  function removeMarker(marker) {
    if (marker) {
      marker.remove();
      tooltipLayout.deleteMarker(marker);
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
    if (!skipRedraw && settings.markerType === 'point-label') {
      tooltipLayout.redrawLines();
    }
  }

  export function updateFamily(id) {
    for (const { language } of languages) {
      if (language.ancestor_id === id) {
        updateLanguage(language.id, true);
      }
    }
    if (settings.markerType === 'point-label') {
      tooltipLayout.redrawLines();
    }
  }

  function updateLabels() {
    if (map) {
      initializeMarkers();
      tooltipLayout.redrawLines();
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
    if (settings.markerType === 'label') {
      return L.divIcon({
        html: getSummaryHtml(obj),
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
    return settings.includeLanguageOnLabel ? (escape(language.name) + ' ' + html) : html;
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

  function getCssVars(colors) {
    const vars = [];
    for (const [key, value] of Object.entries(colors)) {
      const withAlpha = hexAlpha(value, 0.75);
      vars.push(`--${key}:${withAlpha}`);
      if (value === '#000000') {
        vars.push(`--${key}-marker:#ffffff`);
        vars.push(`--${key}-text:#000000`);
      } else {
        vars.push(`--${key}-marker:${withAlpha}`);
        vars.push(`--${key}-text:${yiq(value)}`);
      }
    }
    return vars.join(';');
  }
</script>

<div style={cssVars}>
  <div id="map"></div>
</div>

<style lang="scss">
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
        color: var(--borrowed-text);
        background-color: var(--borrowed-marker);
      }
      .svg.borrowed {
        color: var(--borrowed);
      }

      .marker.inherited {
        color: var(--inherited-text);
        background-color: var(--inherited-marker);
      }
      .svg.inherited {
        color: var(--inherited);
      }

      .marker.unknown {
        color: var(--unknown-text);
        background-color: var(--unknown-marker);
      }
      .svg.unknown {
        color: var(--unknown);
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