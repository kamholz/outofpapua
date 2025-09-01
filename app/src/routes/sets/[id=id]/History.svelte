<script>
  import Entry from './History/Entry.svelte';
  import { onMount } from 'svelte';
  import { pageLoading } from '$lib/stores';

  export let set;
  let log;

  onMount(async () => {
    $pageLoading++;
    try {
      const res = await fetch(`/api/set/${set.id}/log`);
      if (res.ok) {
        ({ log } = (await res.json()));
      }
    } catch (e) {}
    $pageLoading--;
  });

  function date(str) {
    return new Date(str).toLocaleString([], { dateStyle: 'medium', timeStyle: 'long' });
  }

  function stringify(txt) {
    return txt ?? '<none>';
  }

  function stringifyQuoted(txt) {
    if (txt === null) {
      return '<none>';
    } else {
      return '“' + txt + '”';
    }
  }
</script>

{#if log?.length}
  <table>
    {#each log as { details, event, transaction_timestamp, usr_fullname } }
      <tr>
        <td>
          {date(transaction_timestamp)}
        </td>
        <td>
          {usr_fullname ?? '<unknown user>'}
        </td>
        <td>
          {#if event === 'set_created'}
            created set
          {:else if event === 'set_name'}
            changed set name to {stringifyQuoted(details.text)}
          {:else if event === 'set_name_entry_id'}
            changed set name to entry: <Entry {details} />
          {:else if event === 'set_note'}
            changed set note to {stringifyQuoted(details.text)}
          {:else if event === 'set_set_group'}
            changed related sets to: {details.set_ids.length ? details.set_names.join(', ') : '<none>'}
          {:else if event === 'set_member_created'}
            added entry: <Entry {details} />
          {:else if event === 'set_member_deleted'}
            removed entry: <Entry {details} />
          {:else if event === 'set_member_note'}
            changed entry [<Entry {details} />] note to {stringifyQuoted(details.text)}
          {:else if event === 'set_member_reflex'}
            changed entry [<Entry {details} />] reflex to {stringifyQuoted(details.text)}
          {:else if event === 'set_member_reflex_origin'}
            changed entry [<Entry {details} />] reflex origin to “{details.text ?? 'unspecified'}”
          {:else if event === 'set_member_reflex_origin_language_id'}
            changed entry [<Entry {details} />] reflex origin language to {stringify(details.language_name)}
          {:else if event === 'entry_origin'}
            changed entry [<Entry {details} />] origin to “{details.text ?? 'unspecified'}”
          {:else if event === 'entry_origin_language_id'}
            changed entry [<Entry {details} />] origin language to {stringify(details.language_name)}
          {:else if event === 'entry_created'}
            added proto-form entry: <Entry {details} />
          {:else if event === 'entry_updated'}
            updated proto-form entry to: <Entry {details} />
          {:else if event === 'entry_deleted'}
            removed proto-form entry: <Entry {details} />
          {:else}
            {event}
          {/if}
        </td>
      </tr>
    {/each}
  </table>
{/if}

<style lang="scss">
  table {
    border-collapse: collapse;
  }

  td {
    border: 1px solid gray;
    padding-block: 4px;
    padding-inline: 10px;
  }
</style>
