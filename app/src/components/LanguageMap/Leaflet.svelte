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
  
  let L;
  let map;
  let layer;

  $: if (map && baseMap) {
    layer?.remove();
    layer = L.tileLayer(baseMaps[baseMap].url, {
      attribution: baseMaps[baseMap].attribution,
    }).addTo(map);
  }

  onMount(async () => {
    L = await import('leaflet');
    await import('leaflet.fullscreen');

    map = L.map('map', {
      fullscreenControl: true,
      maxZoom,
      scrollWheelZoom: false,
      zoomDelta: 0.5,
      zoomSnap: 0.5,
    });

    map.fitBounds(getBounds(languages));

    initializeMarkers();
  });

  onDestroy(() => {
    map?.remove();
  });

  function initializeMarkers() {
    for (const { language, marker } of languageMarkers) {
      marker.markerObj?.remove();
      marker.markerObj = createMarker(language);
    }
  }

  function createMarker(language) {
    const markerObj = L.marker(language.location, {
      icon: getIcon(language),
    })
    .bindTooltip(getMarkerHtml(language))
    .addTo(map);

    // const markerDom = markerObj._icon;
    // markerDom.style.color = `var(--${marker.colorVar})`;

    return markerObj;
  }

  export function updateFamily(id) {
    for (const { language, marker } of languageMarkers) {
      if (language.ancestor_id === id) {
        marker.markerObj?.remove();
        marker.markerObj = createMarker(language);
      }
    }
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