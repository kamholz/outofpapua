<script context="module">
  export const ssr = false;

  export async function load({ fetch }) {
    const props = {};
    let res = await fetch('/api/language/index.json?category=location');
    if (!res.ok) {
      return { status: 500 };
    }
    props.languages = (await res.json()).rows;

    return { props };
  }
</script>

<script>
  import LanguageMap from '$components/LanguageMap.svelte';

  export let languages;
</script>

<svelte:head>
  <title>Language map | Out of Papua</title>
</svelte:head>

<h2>Language map</h2>
<LanguageMap {languages} />
