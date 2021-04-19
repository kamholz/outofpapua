<script>
  import { page } from '$app/stores';
  import { userSession } from '$stores';
  let path;
  $: path = $page.path;
</script>

<nav>
  <ul>
    <li class:active={path === '/'}><a href="/">Search</a></li>
    <li class:active={path === '/languages'}><a href="/languages">Languages</a></li>
    <li class:active={path === '/dictionaries'}><a href="/dictionaries">Dictionaries</a></li>
    {#if $userSession.user}
      <li class:active={path === '/users'}><a href="/users">Users</a></li>
    {/if}
  </ul>
</nav>

<style>
  ul {
    display: flex;
    justify-content: flex-start;
    margin-inline: 0;
    padding-inline: 0;
    list-style: none;
  }

  li {
    margin-inline-end: 1em;
    padding-block: 0.35em;
    padding-inline: 0.75em;
    background-color: lightgray;
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
