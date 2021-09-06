<script>
  import 'leaflet.fullscreen/Control.FullScreen.css';
  import 'leaflet/dist/leaflet.css';
  import baseMaps from '$lib/basemaps.json';
  import hexAlpha from 'hex-alpha';
  import { escapeHtml as escape } from '$lib/util';
  import { maxZoom } from '$lib/preferences';
  import { onDestroy, onMount } from 'svelte';
  import { yiq } from 'yiq';

  export let languageMarkers;
  export let families;
  export let baseMap;
  export let settings;
  export let colorBy;
  export let colors;

  const languageMarkersById = Object.fromEntries(languageMarkers.map((lm) => [lm.language.id, lm]));
  for (const { markers } of languageMarkers) {
    for (const marker of markers) {
      marker.originClass = getOriginClass(marker.entries);
    }
  }

  let L;
  let tooltipLayout;
  let map;
  let layer;

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
      maxZoom,
      scrollWheelZoom: false,
      zoomDelta: 0.5,
      zoomSnap: 0.5,
    })
    .fitBounds(getBounds(languageMarkers));

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
    for (const lm of languageMarkers.filter(({ selection }) => selection.language)) {
      for (const marker of lm.markers) {
        removeMarker(marker.markerObj);
        marker.markerObj = haveHeadwords(lm, marker)
          ? createMarker(lm, marker)
          : null;
      }
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

  function createMarker(lm, marker) {
    setColorVar(marker);
    const markerObj = L.marker(lm.language.location, {
      icon: getIcon(lm, marker),
    }).addTo(map);

    const markerDom = markerObj._icon;
    if (settings.markerType === 'label') { // div
      markerDom.style.color = `var(--${marker.colorVar}-text)`;
      markerDom.style.backgroundColor = `var(--${marker.colorVar}-marker)`;
    } else { // svg
      markerDom.style.color = `var(--${marker.colorVar})`;
    }

    if (settings.markerType === 'point-label') {
      markerObj.bindTooltip(getSummaryHtml(lm, marker), {
        className: 'marker',
      });
      tooltipLayout.resetMarker(markerObj);
      const labelDom = markerObj.getTooltip()._container;
      labelDom.style.color = `var(--${marker.colorVar}-text)`;
      labelDom.style.backgroundColor = `var(--${marker.colorVar}-marker)`;
    }
    return markerObj;
  }

  function removeMarker(markerObj) {
    if (markerObj) {
      markerObj.remove();
      tooltipLayout.deleteMarker(markerObj);
    }
  }

  function haveHeadwords(lm, marker) {
    return marker.headwords.some((headword) => lm.selection.headwords[headword]);
  }

  export function updateLanguage(id, skipRedraw) {
    const lm = languageMarkersById[id];
    for (const marker of lm.markers) {
      removeMarker(marker.markerObj);
      marker.markerObj = lm.selection.language && haveHeadwords(lm, marker)
        ? createMarker(lm, marker)
        : null;
    }
    if (!skipRedraw && settings.markerType === 'point-label') {
      tooltipLayout.redrawLines();
    }
  }

  export function updateFamily(id) {
    for (const { language } of languageMarkers) {
      if (language.ancestor_id === id) {
        updateLanguage(language.id, true);
      }
    }
    if (settings.markerType === 'point-label') {
      tooltipLayout.redrawLines();
    }
  }

  export function updateView({ latLng, zoom }) {
    map.setView(L.latLng(latLng), zoom);
    tooltipLayout.redrawLines();
  }

  export function getView() {
    const latLng = map.getCenter();
    return {
      latLng: [latLng.lat, latLng.lng],
      zoom: map.getZoom(),
    };
  }

  function getBounds(languageMarkers) {
    const locations = languageMarkers.map(({ language }) => language.location);
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

  function getIcon(lm, marker) {
    if (settings.markerType === 'label') {
      return L.divIcon({
        html: getSummaryHtml(lm, marker),
        className: 'marker',
        iconSize: null,
      });
    } else {
      return L.divIcon({
        html: `<svg viewBox="0 0 16 16"><use href="/icons.svg#${families[lm.language.ancestor_id].shape}" /></svg>`,
        iconSize: null,
      });
    }
  }

  function getSummaryHtml(lm, marker) {
    const { language, selection } = lm;
    const { headwords } = marker;
    const html = headwords
      .filter((headword) => selection.headwords[headword])
      .map((headword) => `<em>${escape(headword)}</em>`).join(', ');
    return settings.includeLanguageOnLabel ? (escape(language.name) + ' ' + html) : html;
  }

  function setColorVar(marker) {
    marker.colorVar = colorBy === 'origin'
      ? marker.originClass
      : `set-${marker.entries[0].set_id}`;
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