<script>
  import SuggestSetMember from '$components/SuggestSetMember.svelte';
  import Svelecte from '$components/Svelecte.svelte';

  export let langSuggest;
  let languages;
</script>

<ul>
  <li>
    <span>Headword:</span>
    <SuggestSetMember
      match="headword"
      {languages}
      on:select
    />
    </li>
  <li>
    <span>Gloss:</span>
    <SuggestSetMember
      match="gloss"
      {languages}
      on:select
    />
  </li>
  <li>
    <span>Languages:</span>
    <Svelecte
      options={langSuggest}
      multiple
      bind:value={languages}
    />
</li>
</ul>

<style lang="scss">
  ul {
    flex-grow: 1;

    li {
      display: flex;
      align-items: center;

      &:not(:last-child) {
        margin-block-end: 12px;
      }

      span {
        flex-shrink: 0;
        inline-size: 8.5em;
        margin-inline-end: 12px;
        text-align: end;
      }
    }
  }
</style>