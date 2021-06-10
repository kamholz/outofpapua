<script>
  import Form from '$components/Form.svelte';
  import { preferences } from '$lib/stores';

  const fields = [
    {
      name: 'hideglosslang',
      label: 'Omit gloss language in entries',
      type: 'checkbox',
    },
  ];

  function handleChange(e) {
    $preferences[e.target.name] = e.target.checked;
  }
</script>

<Form
  {fields}
  values={$preferences}
  style="--formwidth: 18em; --gridtemplate: 90% 10%"
  on:change={handleChange}
/>