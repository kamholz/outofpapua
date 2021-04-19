<script>
  export let columns;
  export let rows;

  for (const column of columns) {
    if (!('value' in column)) {
      column.value = row => row[column.key] ?? '';
    }
  }
</script>

<table>
  <thead>
    {#each columns as column}
      <th>{column.title}</th>
    {/each}
  </thead>
  <tbody>
    {#each rows as row}
      <tr>
        {#each columns as column}
          <td>{column.value(row)}</td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>

<style lang="scss">
  @import '../vars.scss';

  table {
    border: 1px solid black;
    border-collapse: collapse;
  }

  th {
    text-align: start;
    border-block-end: 1px solid black;
  }

  th, td {
    padding-block: 3px;
    padding-inline: 10px;
  }

  tr:nth-child(even) {
    background-color: $lightgray;
  }
</style>
