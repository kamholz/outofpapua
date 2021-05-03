<script>
  export let sense;

  import { englishFirst } from '$lib/util';
  const { glosses } = sense;

  const langs = [];
  for (const language of Object.keys(glosses).sort(englishFirst)) {
    langs.push(glosses[language].join(', ') + ` (${language})`);
  }
  const all = langs.join('; ');
</script>

{all}
