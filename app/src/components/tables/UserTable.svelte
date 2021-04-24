<script>
  import { boolean } from '$lib/util';
  import { session } from '$app/stores';
  import Table from '$components/Table.svelte';

  export let rows;

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

  const controls = $session.user.admin
    ?
      [
        {
          type: 'edit',
          link: row => row.id === $session.user.id ? '/profile' : `/profile/${row.id}`,
        }
      ]
    :
      null;
</script>

<Table
  {columns}
  {rows}
  {controls}
/>
