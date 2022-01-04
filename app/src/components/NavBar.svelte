<script>
  import Icon from 'svelte-awesome';
  import { faBars } from '@fortawesome/free-solid-svg-icons';
  import { hideComparative } from '$lib/stores';
  import { page, session } from '$app/stores';

  const allTabs = [
    {
      title: 'Entries',
      url: '/',
    },
    {
      title: 'Sets',
      url: '/sets',
      comparative: true,
    },
    {
      title: 'Languages',
      url: '/languages',
    },
    {
      title: 'Sources',
      url: '/sources',
    },
    {
      title: 'Compare',
      url: '/compare',
    },
    {
      title: 'Saved Maps',
      url: '/saved_maps',
      private: true,
    },
    {
      title: 'Users',
      url: '/users',
      private: true,
    },
  ];

  $: tabs = getTabs($session, $hideComparative);
  let active = false;

  function getTabs() {
    if ($session.user) {
      return allTabs;
    } else if ($hideComparative) {
      return allTabs.filter((field) => !field.comparative && !field.private);
    } else {
      return allTabs.filter((field) => !field.private);
    }
  }
</script>

<nav>
  <span on:click={() => active = !active}>
    <Icon data={faBars} scale={1.25} />
  </span>
  <ul class:active>
    {#each tabs as { title, url }}
      <li class:active={$page.url.pathname === url}>
        <a href={url} on:click={() => active = false} sveltekit:prefetch>{title}</a>
      </li>
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
      z-index: -999;

      &.active {
        transition: opacity 200ms ease-out;
        opacity: 1;
        z-index: 999;
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
