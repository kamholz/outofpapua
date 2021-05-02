<script>
  export let sense;
  const { glosses } = sense;

  const langs = [];
  for (const language of Object.keys(glosses).sort(compare)) {
    langs.push(glosses[language].join(', ') + ` (${language})`);
  }
  const all = langs.join('; ');

  function compare(a, b) {
    if (a === 'English' && b !== 'English') {
      return -1;
    } else if (b === 'English' && a !== 'English') {
      return 1;
    } else if (a === b) {
      return 0;
    } else {
      return a < b ? -1 : 1;
    }
  }
</script>

{all}
