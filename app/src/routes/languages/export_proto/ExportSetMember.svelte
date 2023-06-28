<script>
  import { glossesSummaryNoLanguage, toolboxMarkup } from '$lib/util';

  export let member;
  $: glosses = member.entry.senses?.[0]?.glosses;
</script>

<div>
  {member.language.name} <em>{member.entry.headword}</em> {#if glosses}{@html toolboxMarkup(glossesSummaryNoLanguage(glosses))}{/if}
</div>

<style>
  div {
    margin-block: 4px;
  }
</style>