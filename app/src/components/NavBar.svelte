<script>
  import { page, session } from '$app/stores';
</script>

<nav>
  <ul>
    <li class:active={$page.path === '/'}><a href="/">Search</a></li>
    <li class:active={$page.path === '/languages'}><a href="/languages">Languages</a></li>
    <li class:active={$page.path === '/dictionaries'}><a href="/dictionaries">Dictionaries</a></li>
    {#if $session.user}
      <li class:active={$page.path === '/users'}><a href="/users">Users</a></li>
    {/if}
  </ul>
</nav>

<style lang="scss">
  @import '../vars.scss';

  ul {
    display: flex;
    justify-content: flex-start;
    margin-inline: 0;
    margin-block: 0 1em;
    padding: 0;
    list-style: none;
  }

  li {
    margin-inline-end: 1em;
    padding-block: 0.35em;
    padding-inline: 0.75em;
    background-color: $lightgray;
    border-radius: 3px;
  }

  li.active {
    font-weight: bold;
  }

  a {
    color: black;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
</style>
