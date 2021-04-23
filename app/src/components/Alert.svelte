<script>
  export let message;
  export let type;
</script>

{#if message}
  <div class={type}>{message}</div>
{/if}

<style lang="scss">
  div {
    margin-block: 1em;
    padding: .75rem 1.25rem;
    border-radius: .25rem;
    border: 1px solid transparent;
  
    &.error {
      color: #721c24;
      background-color: #f8d7da;
      border-color: #f5c6cb;
    }

    &.success {
      color: #155724;
      background-color: #d4edda;
      border-color: #c3e6cb;      
    }
  }
</style>
