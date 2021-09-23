<script>
  import Entry from '$components/EntryRecord/Entry.svelte';
  import { parseRecord } from '$lib/parse_record';

  export let record;
  const entry = parseRecord(record);
</script>

<Entry {entry} />
