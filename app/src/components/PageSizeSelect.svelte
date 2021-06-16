<script>
  import { goto } from '$app/navigation';
  import { pageSizeValues } from '$lib/preferences';
  import { preferences } from '$lib/stores';
  import { serializeQuery, stripEmptyArrayParams } from '$lib/util';

  export let query;
  export let preferenceKey;
  const values = pageSizeValues[preferenceKey];

  function handleSelect(e) {
    const { value } = e.target;
    $preferences[preferenceKey] = value;
    const newQuery = serializeQuery({ ...query, page: 1, pagesize: value });
    stripEmptyArrayParams(newQuery);
    goto('?' + new URLSearchParams(newQuery));
  }
</script>

<form>
  <label for="pagesize">Items per page:</label>
  <select
    id="pagesize"
    name="pagesize"
    value={query.pagesize}
    on:input={handleSelect}
  >
    {#each values as value}
      <option {value}>{value}</option>
    {/each}
  </select>
</form>