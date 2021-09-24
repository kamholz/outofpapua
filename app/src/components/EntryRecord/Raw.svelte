<script>
  export let data;
</script>

<table>
  <thead>
    <tr>
      <th>Marker</th>
      <th>Value</th>
    </tr>
  </thead>
  <tbody>
    {#each data as line (line)}
      <tr>
        <td>{line[0]}</td>
        <td>{line[1]}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style lang="scss">
  table {
    border: 1px solid black;
    border-collapse: collapse;

    tr:nth-child(even) {
      background-color: var(--lighter-gray);
    }

    th {
      border-bottom: 1px solid black;
      text-align: start;
      margin-block-end: 6px;
    }

    th, td {
      padding-block: 5px;
      padding-inline: 8px;
    }

    td:first-child {
      font-style: italic;
      padding-inline: 16px;
    }
  }
</style>