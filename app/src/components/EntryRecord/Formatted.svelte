<script>
  import Entry from '$components/EntryRecord/Entry.svelte';
  import { parseRecord } from '$lib/parse_record';
  import { setContext } from 'svelte';

  /**
   * @typedef {Object} Props
   * @property {any} data
   * @property {any} source
   * @property {boolean} [compact]
   */

  /** @type {Props} */
  let { data, source, compact = false } = $props();
  setContext('source', source);
  setContext('compact', compact);
  const entry = parseRecord(data, source.formatting);
</script>

<Entry {entry} />
