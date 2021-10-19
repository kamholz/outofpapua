<script>
  import Alert from '$components/Alert.svelte';
import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let key;
  export let values;
  export let promises;
  export let options;
  export let handleUpdate;
</script>

<span class="radios">
  {#each options as [value, label] (value)}
    <label>
      <input
        type="radio"
        {value}
        disabled={promises.pending[key]}
        bind:group={values[key]}
        on:change={() => handleUpdate(key)}
      >
      <span>{label}</span>
    </label>
  {/each}
</span>

<style lang="scss">
  .radios {
    display: flex;
    label {
      margin-inline-end: 16px;
      display: flex;
      align-items: center;
    }
    input {
      margin-inline-end: 4px;
    }
  }
</style>