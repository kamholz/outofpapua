<script>
  import Icon from 'svelte-awesome';
  import Paginator from '$components/Paginator.svelte';
  import TableCell from '$components/TableCell.svelte';
  import TableControls from '$components/TableControls.svelte';
  import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
  import { fly } from 'svelte/transition';
  import { serializeQuery, stringify } from '$lib/util';
  import { sineIn, sineOut } from 'svelte/easing';

  export let columns;
  export let rows;
  export let query = null;
  export let pageCount = null;
  export let sortable = false;
  export let editable = false;
  export let paginated = false;
  export let controls = null;
  export let highlight = false;
  let editingCell;

  for (const column of columns) {
    if (!('value' in column)) {
      column.value = (row) => stringify(row[column.key]);
    }
    if (column.link && !('prefetch' in column)) {
      column.prefetch = true;
    }
  }

  function handleEdit(e) {
    if (editingCell !== e.detail) {
      editingCell?.dispatchEvent(new Event('deactivate'));
      editingCell = e.detail;
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

<table class:hoverhighlight={highlight}>
  <thead>
    {#each columns as { key, title } (key)}
      <th>
        {#if sortable}
          <a href={getSortQuery(key, query)}>
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
    {#each $rows as row (row.id)}
      <tr in:fly|local={{ easing: sineIn }} out:fly|local={{ easing: sineOut }}>
        {#each columns as column (column.key)}
          <TableCell {row} {column} {editable} on:edit={handleEdit} on:update />
        {/each}
        {#if controls}
          <TableControls {row} {controls} on:delete on:select />
        {/if}
      </tr>
    {/each}
  </tbody>
</table>

{#if paginated}
  {#if pageCount > 1}
    <Paginator {query} {pageCount} />
  {/if}
{/if}

<style lang="scss">
  @import '../vars.scss';

  table {
    border: 1px solid black;
    border-collapse: collapse;

    &.hoverhighlight {
      tr:nth-child(even):hover {
        background-color: #d6d6d6;
      }

      tr:nth-child(odd):hover {
        background-color: #f5f5f5;
      }
    }

    thead {
      a, a:visited {
        color: black;
        text-decoration: none;
      }
    }

    tr:nth-child(even) {
      background-color: $lightgray;
    }

    tr:nth-child(odd) {
      background-color: white;
    }

    th {
      text-align: start;
      border-block-end: 1px solid black;
    }

    th, :global(td) {
      padding-block: 6px;
      padding-inline: 10px;
    }

    :global(td[contenteditable="true"]) {
      background-color: white;
    }
  }
</style>
