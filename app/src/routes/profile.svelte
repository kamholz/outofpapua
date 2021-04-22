<script context="module">
  export async function load({ session }) {
    if (!session.user) {
      return { status: 401, error: 'Unauthorized' };
    }
    return {};
  }
</script>

<script>
  import { session } from '$app/stores';
  import Form from '$components/Form.svelte';

  const fields = [
    {
      name: 'username',
      label: 'Email',
      type: 'text',
    },
    {
      name: 'fullname',
      label: 'Full name',
      type: 'text',
    },
    {
      label: 'Save',
      type: 'submit',
    }
  ];
</script>

<main>
  <Form {fields} values={$session.user} />
</main>