<script>
  import Entry from '$components/EntryRecord/Entry.svelte';
  import { parseRecord } from '$lib/parse_record';
  import { setContext } from 'svelte';

  export let record;
  setContext('formatting', record.source.formatting);
  const entry = parseRecord(record);
</script>

<Entry {entry} />
