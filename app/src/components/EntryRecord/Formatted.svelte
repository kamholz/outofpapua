<script>
  import Entry from '$components/EntryRecord/Entry.svelte';
  import { parseRecord } from '$lib/parse_record';
  import { setContext } from 'svelte';

  export let data;
  export let source;
  export let compact = false;
  setContext('source', source);
  setContext('compact', compact);
  const entry = parseRecord(data, source.formatting);
</script>

<Entry {entry} />
