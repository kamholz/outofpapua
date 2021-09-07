<script>
  import Svelecte from '$lib/svelecte';

  export let family;
  export let updateFamily;
  const icons = ['circle', 'diamond', 'square', 'star', 'triangle'].map((value) => ({ value }));
</script>

<div>
  {family.name}:
  <Svelecte
    options={icons}
    valueField="value"
    labelField="value"
    searchable={false}
    renderer={(item) => `<svg viewBox="0 0 16 16"><use href="/icons.svg#${item.value}" /></svg>`}
    bind:value={family.shape}
    on:change={updateFamily(family.id)}
  />
</div>

<style lang="scss">
  div {
    display: flex;
    align-items: center;
    justify-content: space-between;

    &:not(:last-child) {
      margin-block-end: 10px;
    }

    :global {
      .svelecte {
        flex: unset;
      }

      .sv-control {
        inline-size: 70px;
        .sv-item-content {
          margin-inline-start: 8px;
        }
      }

      .sv-item-content {
        width: 16px;
        height: 16px;
      }

      .sv-dropdown {
        inline-size: 50px;
        .sv-item {
          display: flex;
          justify-content: space-around;
        }
      }
    }
  }
</style>