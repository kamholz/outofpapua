<script>
  import Icon from 'svelte-awesome';
  import { faClone, faTimes } from '@fortawesome/free-solid-svg-icons';

  export let onClose;
  const scale = 1.25;
  let div;

  function copy() {
    const content = div.nextElementSibling;
    const range = document.createRange();
    range.selectNodeContents(content);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand('copy');
    sel.removeAllRanges();
  }
</script>

<div bind:this={div}>
  <span title="Copy" on:click={copy}>
    <Icon data={faClone} {scale} />
  </span>
  <span title="Close" on:click={onClose}>
    <Icon data={faTimes} {scale} />
  </span>
</div>

<style lang="scss">
  div {
    display: flex;
    float: right;
    margin-block: 20px 10px;
    margin-inline: 10px 20px;
    z-index: 999;
    background-color: white;

    > span:not(:last-child) {
      margin-inline-end: 5px;
    }
  }
</style>
