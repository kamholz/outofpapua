<script>
  import Glosses from '$components/Glosses.svelte';

  export let member;
  $: glosses = member.entry.senses?.[0]?.glosses;
</script>

<div>
  {member.language.name} <em>{member.entry.headword}</em> <Glosses {glosses} language={false} />
</div>

<style>
  div {
    margin-block: 4px;
  }
</style>