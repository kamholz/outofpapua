<script>
  import Modal from 'svelte-simple-modal';
  import { modal } from '$lib/stores';
</script>

<Modal show={$modal} styleWindow={{ width: '80vw' }} />