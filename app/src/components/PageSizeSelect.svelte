<script>
  import { goto } from '$app/navigation';
  import { preferences } from '$lib/stores';
  import { serializeQuery, stripEmptyArrayParams } from '$lib/util';

  export let query;
  const values = [100, 500, 1000, 2000];

  function handleSelect(e) {
    const { value } = e.target;
    $preferences.pagesize = value;
    const newQuery = serializeQuery({ ...query, page: 1, pagesize: value });
    stripEmptyArrayParams(newQuery);
    goto('?' + new URLSearchParams(newQuery));
  }
</script>

<form>
  <label for="pagesize">Rows per page:</label>
  <select
    name="pagesize"
    value={query.pagesize}
    on:input={handleSelect}
  >
    {#each values as value}
      <option {value}>{value}</option>
    {/each}
  </select>
</form>