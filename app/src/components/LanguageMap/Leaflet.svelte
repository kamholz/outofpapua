<script>
  import 'leaflet.fullscreen/Control.FullScreen.css';
  import 'leaflet/dist/leaflet.css';
  import baseMaps from '$lib/basemaps.json';
  import { escapeHtml as escape } from '$lib/util';
  import { getBounds } from '$lib/leaflet';
  import { maxZoom } from '$lib/preferences';
  import { onDestroy, onMount } from 'svelte';

  export let languages;
  export let families;
  export let languageMarkers;
  export let baseMap;
  export let lineLength;
  
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

  $: updateMarkers(lineLength);

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
    });

    map.fitBounds(getBounds(languages));

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
    tooltipLayout.initialize(map, (ply) => {
      ply.setStyle({
        color: '#999',
        weight: 2,
      });
    });
  }

  function initializeMarkers() {
    for (const { language, marker } of languageMarkers) {
      removeMarker(marker.markerObj);
      marker.markerObj = createMarker(language);
    }
    tooltipLayout.setLineLength(lineLength);
  }

  function updateMarkers() {
    if (map) {
      initializeMarkers();
      tooltipLayout.redrawLines();
    }
  }

  function createMarker(language) {
    const markerObj = L.marker(language.location, {
      icon: getIcon(language),
    }).addTo(map);

    // const markerDom = markerObj._icon;
    // markerDom.style.color = `var(--${marker.colorVar})`;

    markerObj.bindTooltip(getMarkerHtml(language), {
      className: 'marker',
    });
    tooltipLayout.resetMarker(markerObj);
    // const labelDom = markerObj.getTooltip()._container;
    // labelDom.style.color = `var(--${marker.colorVar}-text)`;
    // labelDom.style.backgroundColor = `var(--${marker.colorVar}-marker)`;
    return markerObj;
  }

  function removeMarker(markerObj) {
    if (markerObj) {
      markerObj.remove();
      tooltipLayout.deleteMarker(markerObj);
    }
  }

  export function updateFamily(id) {
    for (const { language, marker } of languageMarkers) {
      if (language.ancestor_id === id) {
        removeMarker(marker.markerObj);
        marker.markerObj = createMarker(language);
      }
    }
    tooltipLayout.redrawLines();
  }

  function getIcon(language) {
    return L.divIcon({
      html: `<svg viewBox="0 0 16 16"><use href="/icons.svg#${families[language.ancestor_id].shape}" /></svg>`,
      iconSize: null,
    });
  }

  function getMarkerHtml(language) {
    return escape(language.name);
  }
</script>

<div>
  <div id="map" class="leaflet-map"></div>
</div>

<style lang="scss">
  div {
    width: 100%;
    height: 82vh;
  }
</style>