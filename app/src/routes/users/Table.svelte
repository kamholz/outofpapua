<script>
  import Table from '$components/Table.svelte';
  import { session } from '$lib/stores';

  let { rows, adminView } = $props();

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
      key: 'role',
      title: 'Role',
      value: (v) => v.role.charAt(0).toUpperCase() + v.role.slice(1),
    },
  ];

  const controls = adminView
    ?
    [
      {
        type: 'edit',
        link: (row) => row.id === $session.user.id ? '/profile' : `/profile/${row.id}`,
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
