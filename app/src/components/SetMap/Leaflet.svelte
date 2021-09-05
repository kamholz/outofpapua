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
  export let colorBy;
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

  $: updateMarkers(settings, colorBy);
  $: cssVars = getCssVars(colors, colorBy);

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

  function updateMarkers() {
    if (map) {
      initializeMarkers();
      tooltipLayout.redrawLines();
    }
  }

  function createMarker(obj) {
    setColorVar(obj);
    const marker = L.marker(obj.language.location, {
      icon: getIcon(obj),
    }).addTo(map);

    const markerDom = marker._icon;
    if (settings.markerType === 'label') { // div
      markerDom.style.color = `var(--${obj.colorVar}-text)`;
      markerDom.style.backgroundColor = `var(--${obj.colorVar}-marker)`;
    } else { // svg
      markerDom.style.color = `var(--${obj.colorVar})`;
    }

    if (settings.markerType === 'point-label') {
      marker.bindTooltip(getSummaryHtml(obj), {
        className: 'marker',
      });
      tooltipLayout.resetMarker(marker);
      const labelDom = marker.getTooltip()._container;
      labelDom.style.color = `var(--${obj.colorVar}-text)`;
      labelDom.style.backgroundColor = `var(--${obj.colorVar}-marker)`;
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
    const { language } = obj;
    if (settings.markerType === 'label') {
      return L.divIcon({
        html: getSummaryHtml(obj),
        className: 'marker',
        iconSize: null,
      });
    } else {
      return L.divIcon({
        html: `<svg viewBox="0 0 16 16"><use href="/icons.svg#${families[language.ancestor_id].shape}" /></svg>`,
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

  function setColorVar(obj) {
    obj.colorVar = colorBy === 'origin'
      ? obj.originClass
      : `set-${obj.entries[0].set_id}`;
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
    const vars = colorBy === 'origin'
      ? [].concat(...Object.entries(colors.origin).map(([key, value]) => getCssVarsForColor(key, value)))
      : [].concat(...Object.entries(colors.set).map(([key, value]) => getCssVarsForColor(`set-${key}`, value)));
    return vars.join(';');
  }

  function getCssVarsForColor(name, color) {
    const vars = [];
    const withAlpha = hexAlpha(color, 0.75);
    vars.push(`--${name}:${withAlpha}`);
    if (color === '#000000') {
      vars.push(`--${name}-marker:#ffffff`);
      vars.push(`--${name}-text:#000000`);
    } else {
      vars.push(`--${name}-marker:${withAlpha}`);
      vars.push(`--${name}-text:${yiq(color)}`);
    }
    return vars;
  }
</script>

<div style={cssVars}>
  <div id="map"></div>
</div>

<style lang="scss">
  div {
    width: 100%;
    height: 82vh;

    :global {
      .marker {
        padding: 6px;
        width: max-content;
        max-width: 12em;
        line-height: 1.25;
        border: transparent;
        border-radius: 6px;
        white-space: unset;
      }

      .leaflet-marker-icon > svg {
        width: 12px;
        height: 12px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
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