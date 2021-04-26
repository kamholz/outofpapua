<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  import { boolean } from '$lib/util';
  import { session } from '$app/stores';
  import { pageLoading } from '$stores';
  import * as crud from '$actions/crud';
  import Alert from '$components/Alert.svelte';
  import Table from '$components/Table.svelte';

  export let rows;
  export let admin = false;
  let error = null;

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

  const controls = admin
    ?
      [
        {
          type: 'edit',
          link: row => row.id === $session.user.id ? '/profile' : `/profile/${row.id}`,
        },
        {
          type: 'delete',
          candelete: row => !row.admin,
          confirm: row => confirm(`Are you sure you want to delete user "${row.fullname}"?`),
        }
      ]
    :
      null;

  const del = crud.makeDeleter('users');

  async function handleDelete(e) {
    $pageLoading++;
    try {
      error = null;
      await del(e.detail.id);
      dispatch('refresh');
    } catch (err) {
      error = err.message;
    }
    $pageLoading--;
  }
</script>

<Alert type="error" message={error} />
<Table
  {columns}
  {rows}
  {controls}
  on:delete={handleDelete}
/>
