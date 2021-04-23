<script>
  //import { session } from '$app/stores';
  import Form from '$components/Form.svelte';

  export let user;
  export let admin = false;

  const fields1 = [
    {
      name: 'username',
      label: 'Email',
      type: 'text',
    },
    {
      name: 'fullname',
      label: 'Full name',
      type: 'text',
    }
  ];

  const fields2 = [
    {
      name: 'current',
      label: 'Current password',
      type: 'text',
    },
    {
      name: 'new',
      label: 'New password',
      type: 'password',
    },
    {
      name: 'new2',
      label: 'Confirm password',
      type: 'password',
    }
  ];

  if (admin) {
    fields1.push({
      name: 'admin',
      label: 'Admin',
      type: 'checkbox',
    });
    fields2.shift();
  }

  function handleUpdate(e) {
    console.log(e);
  }
</script>

<h2>Profile</h2>
<Form 
  method="POST"
  fields={fields1} 
  values={user}
  submitLabel="Save"
  on:submit={handleUpdate}
/>
<h3>Change password</h3>
<Form 
  method="POST"
  fields={fields2} 
  submitLabel="Update"
  style="width: 25em"
  on:submit={handleUpdate}
/>
