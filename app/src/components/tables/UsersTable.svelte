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
        }
      ]
    :
      null;
</script>

<Alert type="error" message={error} />
<Table
  {columns}
  {rows}
  {controls}
/>
