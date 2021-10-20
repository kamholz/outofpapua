<script>
  import Form from '$components/Form.svelte';
  import { getContext } from 'svelte';

  const preferences = getContext('preferences');

  const fields = [
    {
      name: 'hideGlossLang',
      label: 'Omit gloss language in entries',
      type: 'checkbox',
    },
  ];

  function handleChange(e) {
    preferences.update({ [e.target.name]: e.target.checked });
  }
</script>

<Form
  {fields}
  values={$preferences}
  style="--form-width: 23em; --label-width: 90%;"
  on:change={handleChange}
/>