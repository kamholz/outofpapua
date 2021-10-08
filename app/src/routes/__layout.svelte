<script>
  import '../app.scss';
  import Icon from 'svelte-awesome';
  import Login from '$components/Login.svelte';
  import Modal from 'svelte-simple-modal';
  import ModalContent from '$components/Modal/Content.svelte';
  import NavBar from '$components/NavBar.svelte';
  import PageContext from '$components/PageContext.svelte';
  import { faSpinner } from '@fortawesome/free-solid-svg-icons';
  // import { fade } from 'svelte/transition';
  import { navigating, session } from '$app/stores';
  import { pageLoading } from '$lib/stores';
  // import { onMount } from 'svelte';
  // import { registerListener, broadcast } from '$lib/socket';

  // let broadcasts = [];

  // onMount(() => {
  //   document.body.style.opacity = null;
  //   registerListener(receiveBroadcast);
  //   setInterval(() => {
  //     broadcast($session.user, `did thing #${count}`);
  //     count++;
  //   }, 1000);
  // });

  // async function receiveBroadcast(data) {
  //   if (data.user !== $session.user?.fullname) {
  //     data.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  //     broadcasts.push(data);
  //     broadcasts = broadcasts;
  //   }
  // }

  // function clearBroadcasts() {
  //   broadcasts = [];
  // }
</script>

{#if $navigating || $pageLoading > 0}
  <div class="loading">
    <Icon data={faSpinner} pulse />
  </div>
{/if}
<Login username={$session.user?.username} />

{#if $session.user}
  <NavBar />
  <main>
  <!-- {#key $page.path}
    <div in:fade={{ duration: 200 }}> -->
    <PageContext session={$session}>
      <Modal styleWindow={{ width: '80vw' }}>
        <ModalContent />
      </Modal>
      <slot />
    </PageContext>
    <!-- </div>
  {/key} -->
  </main>
{/if}

<!-- {#if broadcasts.length}
  <div id="activity" bind:this={activity} transition:fade={{ duration: 200 }}>
    <ul>
      {#each broadcasts as { user, action, time }}
        <li transition:slide>
          <span><strong>{time}</strong> {user} {action}</span>
        </li>
      {/each}
    </ul>
    <span class="close" on:click={clearBroadcasts}>
      <Icon data={faTimes} />
    </span>
  </div>
{/if}

<style lang="scss">
  #activity {
    position: fixed;
    right: 20px;
    bottom: 20px;
    inline-size: 250px;
    max-block-size: 250px;
    border-radius: 6px;
    border: 1px solid black;
    padding: 10px;
    font-size: 14px;
    overflow: hidden;

    ul {
      margin-block-start: 8px;
    }

    li {
      margin-inline-start: 1.25em;
    }

    span.close {
      position: absolute;
      top: 3px;
      right: 3px;
      &:hover {
        color: gray;
      }
    }
  }
</style> -->