<script context="module">
  export async function load({ page: { params }, fetch }) {
    const res = await fetch(`/api/record/${params.id}.json`);
    if (!res.ok) {
      return { status: 500, error: 'Internal error' };
    }
    return { props: { record: await res.json() } };
  }
</script>

<script>
  export let record;
</script>

<h2>Entry from {record.source_reference}</h2>
{#if record.page_num}
  <div>
    Page number: {record.page_num}
  </div>
{/if}
<table>
  <thead>
    <tr>
      <th>Marker</th>
      <th>Value</th>
    </tr>
  </thead>
  <tbody>
    {#each record.data as line (line)}
      <tr>
        <td>{line[0]}</td>
        <td>{line[1]}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style lang="scss">
  div {
    margin-block-end: 16px;
  }

  table {
    max-width: 600px;
    border: 1px solid black;
    border-collapse: collapse;

    tr:nth-child(even) {
      background-color: $lightergray;
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