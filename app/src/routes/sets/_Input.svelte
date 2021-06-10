<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let value;

  function handleKeyDown(e) {
    if (e.keyCode === 13) { // enter
      e.preventDefault();
      dispatch('submit');
    } else if (e.keyCode === 27) { // esc
      e.preventDefault();
      dispatch('cancel');
    }
  }
</script>

<span
  contenteditable="true"
  bind:textContent={value}
  on:keydown={handleKeyDown}
/>

<style>
  span {
    border: 0.25px solid #767676;
    border-radius: 1px;
    padding-inline: 4px;
    font-weight: normal;
  }
</style>