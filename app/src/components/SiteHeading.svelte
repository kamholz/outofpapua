<script>
  import Login from '$components/Login.svelte';
  import { session } from '$lib/stores';

  const title = 'OUTOFPAPUA database: Lexicons of the West Papuan language area';
</script>

<div>
  <h1>{title}</h1>
  <Login username={$session.user?.username} />
</div>

<style lang="scss">
  div {
    display: flex;
    justify-content: space-between;
    margin-block-end: 1.25em;
    margin-inline-end: 1em;
  }

  h1 {
    font-size: 1.65em;
    font-weight: bold;
  }
</style>