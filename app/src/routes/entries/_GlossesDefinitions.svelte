<script>
  export let sense;
  const { definitions, glosses } = sense;

  function summary(item) {
    return item.map(({ language, txt }) =>
      `‘${txt.join(', ')}’ (${language})`
    ).join('; ');
  }
</script>

{#if glosses.length}
  <div>
    Glosses: {summary(glosses)}
  </div>
{/if}
{#if definitions.length}
  <div>
    Definitions: {summary(definitions)}
  </div>
{/if}

<style>
  div {
    padding-left: 2em;
    text-indent: -1em;
  }
</style>