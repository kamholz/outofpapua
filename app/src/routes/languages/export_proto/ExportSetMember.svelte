<script>
  import Glosses from '$components/Glosses.svelte';
  import Reflex from '$components/Reflex.svelte';

  export let member;
</script>

<div>
  {member.language.name} <Reflex reflex={member.reflex} headword={member.entry.headword} space={false} /> <Glosses glosses={member.entry.senses?.[0]?.glosses} preferred />
</div>

<style>
  div {
    margin-block: 4px;
  }
</style>