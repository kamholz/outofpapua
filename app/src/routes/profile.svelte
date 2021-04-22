<script context="module">
  export async function load({ fetch, session }) {
    if (!session.user) {
      return { status: 401, error: 'Unauthorized' };
    }
    return {};
  }
</script>

<script>
  import { session } from '$app/stores';
  export let id = $session.user?.id;
</script>
