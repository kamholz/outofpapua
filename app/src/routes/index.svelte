<script context="module">
  import SearchForm from '$components/SearchForm.svelte';
  import { normalizeQuery } from '$utils/form';

  let query = {};
  let result;

  export async function load({ page, fetch }) {
    query = normalizeQuery(page.query);
    if (['headword','gloss'].some(attr => attr in query)) {
      const res = await fetch('/search.json' + '?' + new URLSearchParams(query));
      if (res.ok) {
        result = await res.json();
      }
    }

    return {};
  }
</script>

<svelte:head>
  <title>Out of Papua</title>
</svelte:head>

<main>
  <h1>Out of Papua</h1>

  <SearchForm {...query} />

  {#if result}
    <h2>Search results</h2>
    <table>
      <thead>
        <th>Language</th>
        <th>Headword</th>
        <th>POS</th>
        <th>Gloss</th>
        <th>Gloss Language</th>
      </thead>
      <tbody>
        {#each result as row}
          <tr>
            <td>{row.language}</td>
            <td>{row.headword}</td>
            <td>{row.pos}</td>
            <td>{row.gloss}</td>
            <td>{row.gloss_language}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</main>
