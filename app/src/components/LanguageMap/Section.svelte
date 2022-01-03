<script>
  export let name;
</script>

<div class="section">
  <div class="heading">
    <h3>{name}</h3>
  </div>
  <div class="content">
    <slot />
  </div>
</div>

<style lang="scss">
  h3 {
    margin: 0;
  }

  .section {
    margin-block-end: 1.5em;
  }

  .heading {
    display: flex;
    align-items: center;
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-block-start: 1em;

    :global(> div) {
      width: 100%;
    }
  }
</style>