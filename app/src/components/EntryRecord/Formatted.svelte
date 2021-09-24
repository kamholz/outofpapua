<script>
  import Entry from '$components/EntryRecord/Entry.svelte';
  import { parseRecord } from '$lib/parse_record';
  import { setContext } from 'svelte';

  export let data;
  export let formatting;
  setContext('formatting', formatting);
  const entry = parseRecord(data, formatting);
</script>

<Entry {entry} />
