<script context="module">
  export async function load({ fetch, page: { params }, session }) {
    const props = {
      editable: session.user !== null,
    };
    const res = await fetch(`/api/set/${params.id}.json`);
    if (!res.ok) {
      return { status: 500, error: 'Internal error' };
    }
    props.set = await res.json();
    return { props };
  }
</script>

<script>
  import SetMember from './_Member.svelte';
  import { fade } from 'svelte/transition';

  export let set;
  export let editable;
</script>

<div in:fade={{ duration: 200 }}>
<h2>Set {set.id}</h2>

{#if set.note !== null}
  <div>
    Notes: {set.note}
  </div>
{/if}

{#each set.members as member (member.entry_id)}
  <SetMember {member} {editable} />
{/each}

</div>
