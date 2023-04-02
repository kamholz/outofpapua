<script>
  import Icon from 'svelte-awesome';
  import { faBars } from '@fortawesome/free-solid-svg-icons';
  import { hideComparative, session } from '$lib/stores';
  import { page } from '$app/stores';

  export let type; // compact, full

  const tabsAll = [
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
      private: true,
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
      return tabsAll;
    } else if ($hideComparative) {
      return tabsAll.filter((field) => !field.comparative && !field.private);
    } else {
      return tabsAll.filter((field) => !field.private);
    }
  }
</script>

<nav class={type}>
  {#if type === 'compact'}
    <div on:click={() => active = !active}>
      <Icon data={faBars} scale={1.25} />
    </div>
  {/if}
  <ul class:active>
    {#each tabs as { title, url }}
      <li class:active={$page.url.pathname === url}>
        <a href={url} on:click={() => active = false}>{title}</a>
      </li>
    {/each}
  </ul>
</nav>

<style lang="scss">
  nav {
    &.compact {
      display: none;
    }
    &.full {
      display: block;
    }
  }

  div {
    width: 28px;
    height: 28px;
    margin-block-end: 6px;

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
    nav {
      &.compact {
        display: block;
      }
      &.full {
        display: none;
      }
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
