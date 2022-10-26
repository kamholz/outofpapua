<script>
  import Table from '$components/Table.svelte';
  import { boolean } from '$lib/util';
  import { page } from '$app/stores';

  export let rows;
  export let admin = false;

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
      value: (v) => boolean(v.admin),
    },
  ];

  const controls = admin
    ?
    [
      {
        type: 'edit',
        link: (row) => row.id === $page.data.user.id ? '/profile' : `/profile/${row.id}`,
      },
    ]
    :
    null;
</script>

<Table
  {columns}
  {rows}
  {controls}
/>
