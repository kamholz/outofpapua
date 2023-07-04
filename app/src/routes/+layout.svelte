<script>
  import '../app.scss';
  import Icon from 'svelte-awesome';
  import Modal from 'svelte-simple-modal';
  import ModalContent from '$components/Modal/Content.svelte';
  import NavBar from '$components/NavBar.svelte';
  import PageContext from '$components/PageContext.svelte';
  import SiteFooter from '$components/SiteFooter.svelte';
  import SiteHeading from '$components/SiteHeading.svelte';
  import { faSpinner } from '@fortawesome/free-solid-svg-icons';
  import { fade } from 'svelte/transition';
  import { navigating, page } from '$app/stores';
  import { pageLoading, session } from '$lib/stores';

  $session = { // eslint-disable-line prefer-const
    preferences: $page.data.preferences,
    user: $page.data.user,
  };
</script>

{#if $navigating || $pageLoading > 0}
  <div class="loading">
    <Icon data={faSpinner} pulse />
  </div>
{/if}

<NavBar type="compact" />
<SiteHeading />
<NavBar type="full" />
<main>
{#key $page.url.pathname}
  <div in:fade={{ duration: 200 }}>
    <PageContext session={$session}>
      <Modal styleWindow={{ width: '80vw' }}>
        <ModalContent />
      </Modal>
      <slot />
    </PageContext>
  </div>
{/key}
</main>
<SiteFooter />
