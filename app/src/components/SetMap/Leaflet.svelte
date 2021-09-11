<script>
  import 'leaflet.fullscreen/Control.FullScreen.css';
  import 'leaflet/dist/leaflet.css';
  import baseMaps from '$lib/basemaps.json';
  import hexAlpha from 'hex-alpha';
  import { escapeHtml as escape, maybeGloss } from '$lib/util';
  import { getContext, onDestroy, onMount } from 'svelte';
  import { maxZoom } from '$lib/preferences';
  import { yiq } from 'yiq';

  export let languages;
  export let families;
  export let languageMarkers;
  export let baseMap;
  export let markerType;
  export let showLanguage;
  export let showGloss;
  export let headwordDisplay;
  export let lineLength;
  export let colorBy;
  export let colors;
  const ipaFunctions = getContext('ipaFunctions');

  const languageMarkersById = {};
  for (const lm of languageMarkers) {
    const { id } = lm.language;
    if (!(id in languageMarkersById)) {
      languageMarkersById[id] = [];
    }
    languageMarkersById[id].push(lm);
    for (const marker of lm.markers) {
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
    }).addTo(map);
  }

  $: updateMarkers(markerType, showLanguage, showGloss, headwordDisplay, lineLength, colorBy);
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
    .fitBounds(getBounds());

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
    if (markerType === 'point-label') {
      tooltipLayout.initialize(map, (ply) => {
        ply.setStyle({
          color: '#999',
          weight: 2,
        });
      });
    }
  }

  function initializeMarkers() {
    for (const lm of languageMarkers.filter(({ language }) => language.selected)) {
      for (const marker of lm.markers) {
        removeMarker(marker.markerObj);
        marker.markerObj = haveSelectedEntry(marker)
          ? createMarker(lm, marker)
          : null;
      }
    }
    if (markerType === 'point-label') {
      tooltipLayout.setLineLength(lineLength);
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
    if (markerType === 'label') { // div
      markerDom.style.color = `var(--${marker.colorVar}-text)`;
      markerDom.style.backgroundColor = `var(--${marker.colorVar}-marker)`;
    } else { // svg
      markerDom.style.color = `var(--${marker.colorVar})`;
    }

    if (markerType === 'point-label') {
      markerObj.bindTooltip(getMarkerHtml(lm, marker), {
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

  function haveSelectedEntry(marker) {
    return marker.entries.some((v) => v.selected);
  }

  export function updateLanguage(id, skipRedraw) {
    for (const lm of languageMarkersById[id]) {
      for (const marker of lm.markers) {
        removeMarker(marker.markerObj);
        marker.markerObj = lm.language.selected && haveSelectedEntry(marker)
          ? createMarker(lm, marker)
          : null;
      }
    }
    if (!skipRedraw && markerType === 'point-label') {
      tooltipLayout.redrawLines();
    }
  }

  export function updateFamily(id) {
    for (const { language } of languageMarkers) {
      if (language.ancestor_id === id) {
        updateLanguage(language.id, true);
      }
    }
    if (markerType === 'point-label') {
      tooltipLayout.redrawLines();
    }
  }

  export function updateView({ latLng, zoom }) {
    map.setView(L.latLng(latLng), zoom);
  }

  export function getView() {
    const latLng = map.getCenter();
    return {
      latLng: [latLng.lat, latLng.lng],
      zoom: map.getZoom(),
    };
  }

  function getBounds() {
    const locations = Object.values(languages).map((v) => v.location);
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
    if (markerType === 'label') {
      return L.divIcon({
        html: getMarkerHtml(lm, marker),
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

  function getMarkerHtml(lm, marker) {
    const { language } = lm;
    const html = getEntriesHtml(marker);
    return showLanguage ? (escape(language.name) + ' ' + html) : html;
  }

  function getEntriesHtml(marker) {
    const selected = marker.entries.filter((entry) => entry.selected);
    const items = showGloss
      ? selected.map((entry) => `<em>${getHeadwordHtml(entry)}</em>${escape(maybeGloss(entry.senses))}`)
      : selected.map((entry) => `<em>${getHeadwordHtml(entry)}</em>`);
    return [...new Set(items)].join(', ');
  }

  function getHeadwordHtml({ headword, headword_ipa, ipa_conversion_rule, reflex }) {
    if (headwordDisplay === 'plain') {
      return escape(headword_ipa ?? headword);
    } else {
      /* eslint-disable eqeqeq */
      const [before, reflexProper, after] = reflex == null
        ? ['', headword, '']
        : reflex.match(/^(.*)\|(.+)\|(.*)$/).slice(1);

      const convert = ipaFunctions[ipa_conversion_rule] ?? ((v) => v);
      return headwordDisplay === 'reflex-only'
        ? escape(convert(reflexProper))
        : `${escape(convert(before))}<strong>${escape(convert(reflexProper))}</strong>${escape(convert(after))}`;
    }
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