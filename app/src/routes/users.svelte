<script context="module">
  import Table from '$components/Table.svelte';

  export async function load({ fetch }) {
      const res = await fetch('/api/users.json');
      if (res.ok) {
        return { props: { rows: await res.json() } };
      }

    return {};
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
      value: v => (v.admin ? 'yes' : 'no'),
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
