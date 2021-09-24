<script>
  import Icon from 'svelte-awesome';
  import Paginator from '$components/Paginator.svelte';
  import TableRow from '$components/TableRow.svelte';
  import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
  import { serializeQuery, stringify } from '$lib/util';

  export let columns;
  export let rows;
  export let query = null;
  export let pageCount = null;
  export let sortable = false;
  export let editable = false;
  export let paginated = false;
  export let controls = null;
  export let highlight = false;
  export let searchContext = false;
  let editingCell = null;
  $: columnCount = columns.length + (controls ? 1 : 0);

  $: for (const column of columns) {
    if (!('value' in column)) {
      column.value = (row) => stringify(row[column.key]);
    }
    if (column.editable && !('inputValue' in column)) {
      column.inputValue = column.value;
    }
    if (column.link && !('prefetch' in column)) {
      column.prefetch = true;
    }
  }

  function getSortQuery(key, query) {
    const sortQuery = { ...query };
    if (key === query.sort) {
      sortQuery.asc = !sortQuery.asc;
    } else {
      sortQuery.sort = key;
      sortQuery.asc = true;
    }
    return serializeQuery(sortQuery);
  }
</script>

{#if paginated && pageCount > 1}
  <Paginator {query} {pageCount} />
{/if}

<table class:hoverhighlight={highlight} class:searchcontext={searchContext}>
  <thead>
    {#each columns as { key, sortKey, title } (key)}
      <th>
        {#if sortable}
          <a href={getSortQuery(sortKey ?? key, query)}>
            {title}
            {#if key === query.sort}
              <Icon data={query.asc ? faCaretUp : faCaretDown} />
            {/if}
          </a>
        {:else}
          <span>{title}</span>
        {/if}
      </th>
    {/each}
    {#if controls}
      <th></th>
    {/if}
  </thead>
  <tbody>
    {#each rows as row (row.id)}
      <TableRow
        {row}
        {columns}
        {controls}
        {editable}
        bind:editingCell
        on:update
        on:delete
        on:select
        on:link
      />
      {#if searchContext}
        <tr>
          <td class="searchcontext" colspan={columns.length}>
            <slot {row} />
          </td>
          {#if controls}
            <td></td>
          {/if}
        </tr>
      {/if}
    {/each}
  </tbody>
</table>

{#if paginated}
  {#if pageCount > 1}
    <Paginator {query} {pageCount} />
  {/if}
{/if}

<style lang="scss">
  table {
    border: 1px solid black;
    border-collapse: collapse;

    thead {
      a, a:visited {
        color: black;
        text-decoration: none;
      }
    }

    th {
      text-align: start;
      border-block-end: 1px solid black;
    }

    th, :global(td) {
      padding-block: 6px;
      padding-inline: 10px;
    }

    td.searchcontext {
      padding-inline-start: 2.5em;
    }

    :global {
      tr:nth-child(even) {
        background-color: var(--light-gray);
      }

      tr:nth-child(odd) {
        background-color: white;
      }
    }

    &.searchcontext :global {
      tr:nth-child(4n), tr:nth-child(4n+3) {
        background-color: var(--light-gray);
      }

      tr:nth-child(4n+1), tr:nth-child(4n+2) {
        background-color: white;
      }
    }

    &.hoverhighlight :global {
      tr:nth-child(even):hover {
        background-color: #d6d6d6;
      }

      tr:nth-child(odd):hover {
        background-color: #f5f5f5;
      }
    }

    &.hoverhighlight.searchcontext :global {
      tr:nth-child(4n):hover, tr:nth-child(4n+3):hover {
        background-color: #d6d6d6;
      }

      tr:nth-child(4n+1):hover, tr:nth-child(4n+2):hover {
        background-color: #f5f5f5;
      }
    }
  }
</style>
