<script>
  import { maybeLanguageName } from '$lib/util';
  import { preferences } from '$stores';

  export let senses;
  export let multilang;
  const multisense = senses.length > 1;

  function mungePos(pos) {
    return pos.replace(/\.$/, '');
  }

  function joinGlosses(glosses) {
    if (multilang) {
      return glosses.map(({ language_name, txt }) =>
        `‘${txt.join(', ')}’` + maybeLanguageName(language_name, $preferences)
      ).join('; ');
    } else {
      return `‘${glosses[0].txt.join(', ')}’`;
    }
  }
</script>

<td>
  {#each senses as { pos, glosses }, i}
    {#if glosses.length}
      <p>
        {#if multisense}{i + 1}. {/if}{#if pos}<em>{mungePos(pos)}</em>. {/if}{joinGlosses(glosses)}
      </p>
    {/if}
  {/each}
</td>

<style>
  p {
    padding-inline-start: 1em;
    text-indent: -1em;
  }
</style>