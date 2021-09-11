<script>
  import Icon from 'svelte-awesome';
  import { faBars } from '@fortawesome/free-solid-svg-icons';
  import { page, session } from '$app/stores';

  const tabs = [
    ['Entries', '/'],
    ['Sets', '/sets'],
    ['Languages', '/languages'],
    ['Sources', '/sources'],
    ['Comparison', '/compare']
  ];
  if ($session.user) {
    tabs.push(['Users', '/users']);
  }

  let active = false;
</script>

<nav>
  <span on:click={() => active = !active}>
    <Icon data={faBars} scale={1.25} />
  </span>
  <ul class:active>
    {#each tabs as [title, url]}
      <li class:active={$page.path === url}><a href={url} sveltekit:prefetch>{title}</a></li>
    {/each}
  </ul>
</nav>

<style lang="scss">
  span {
    display: none;
    position: absolute;
    top: 28px;
    left: 28px;

    :global(.fa-icon) {
      margin: 0;
    }
  }

  ul {
    display: flex;
    margin-block-end: 1em;
  }

  li {
    margin-inline-end: 1em;
    padding-block: 0.35em;
    padding-inline: 0.75em;
    background-color: var(--light-gray);
    border-radius: 3px;

    &.active {
      font-weight: bold;
    }
  }

  a {
    color: black;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  @media (max-width: $breakpoint_medium) {
    span {
      display: block;
    }

    ul {
      opacity: 0;
      position: absolute;
      flex-direction: column;
      padding-block: 1.25em;
      padding-inline: 2.25em;
      background-color: var(--light-gray);

      &.active {
        transition: opacity 200ms ease-out;
        opacity: 1;
      }
    }

    li {
      margin: 0;
      padding-inline: 0;
      padding-block: 0.65em;
      background-color: unset;
      border-radius: unset;
    }
  }
</style>
