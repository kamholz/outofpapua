<script>
  import Icon from 'svelte-awesome';
  import { createPopover, popoverContent, popoverTrigger } from '$lib/popover';
  import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
  import { fade } from 'svelte/transition';

  const popover = createPopover({
    click: true,
    show: () => showPopover = true,
    hide: () => showPopover = false,
  });
  let showPopover = false;
</script>

<div use:popoverTrigger={popover}>
  <Icon data={faQuestionCircle} />
</div>
{#if showPopover}
  <div
    class="popover"
    use:popoverContent={popover}
    transition:fade|local={{ duration: 200 }}
  >
    <h1>Regular expression reference</h1>
    <div class="items">
      <div>
        <h2>Boundaries:</h2>
        <dl>
          <dt>^</dt>
          <dd>start of string</dd>
          <dt>$</dt>
          <dd>end of string</dd>
          <dt>\y</dt>
          <dd>word boundary</dd>
        </dl>
      </div>
      <div>
        <h2>Quantifiers:</h2>
        <dl>
          <dt>+</dt>
          <dd>one or more</dd>
          <dt>*</dt>
          <dd>zero or more</dd>
          <dt>?</dt>
          <dd>zero or one</dd>
        </dl>
      </div>
      <div>
        <h2>Characters:</h2>
        <dl>
          <dt>.</dt>
          <dd>any character</dd>
          <dt>\w</dt>
          <dd>word character</dd>
          <dt>\W</dt>
          <dd>non-word character</dd>
          <dt>[abc]</dt>
          <dd>custom set</dd>
          <dt>[^abc]</dt>
          <dd>negated set</dd>
        </dl>
      </div>
      <div>
        <h2>Other:</h2>
        <dl>
          <dt>|</dt>
          <dd>or (e.g. <span class="code">a|b</span>)</dd>
          <dt>()</dt>
          <dd>grouping</dd>
        </dl>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  h1 {
    font-size: 14px;
    font-weight: bold;
    margin-block: 0 0.75em;
  }

  h2 {
    font-size: 14px;
    font-weight: normal;
    margin-block: 0.35em 0.35em;
  }

  .popover {
    padding: 12px;
    @include popover;

    .items {
      column-count: 2;
      > div {
        break-inside: avoid;
      }
    }

    dl {
      display: flex;
      flex-wrap: wrap;
      width: 15em;
      margin-inline-start: 1em;
      margin-block-end: 0.35em;
    }
    dt {
      flex: 0 0 30%;
      font-family: monospace;
      margin-block-end: 6px;
    }
    dd {
      flex: 0 0 70%;
    }
    .code {
      font-family: monospace;
    }
  }
</style>
