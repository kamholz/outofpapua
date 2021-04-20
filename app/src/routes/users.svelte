<script context="module">
  import Table from '$components/Table.svelte';
  import { boolean } from '$lib/util';

  export async function load({ fetch }) {
    const props = {};
    const res = await fetch('/api/users.json');
    if (res.ok) {
      props.rows = await res.json();
    }
    return { props };
  }

  const columns = [
    {
      key: 'fullname',
      title: 'Name',
    },
    {
      key: 'username',
      title: 'Email',
    },
    {
      key: 'admin',
      title: 'Admin',
      value: v => boolean(v.admin),
    }
  ];
</script>

<script>
  export let rows;
</script>

<main>
  <h2>Users</h2>
  {#if rows}
    <Table {columns} {rows} />
  {:else}
    <span>error</span>
  {/if}
</main>
