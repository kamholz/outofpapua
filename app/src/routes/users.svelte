<script context="module">
  import { ensureAuthed } from '$actions/auth';

  export function load({ page, session }) {
    const refresh = ensureAuthed(page, session);
    return refresh ? refresh : {};
  }
</script>

hello
