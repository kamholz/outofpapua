import { createPopperActions } from 'svelte-popperjs';

const graceMs = 300;

export function createPopover(args) {
  const [popperRef, popperContent] = createPopperActions({
    modifiers: [
      { name: 'offset', options: { offset: [0, 8] } },
    ],
  });
  return {
    ...args,
    popperRef,
    popperContent,
  };
}

export function popoverTrigger(node, popover) {
  const { click, hide, hover, popoverRef, popperRef, prefetch, show } = popover;
  const actions = popperRef(node);
  let open = false;
  let clickOpen = false;
  let waitingToShow = false;
  let waitingToHide = false;
  let timeout;

  createClickListeners(node);
  createHoverListeners(node);
  popover.createHoverListeners = createHoverListeners;
  popover.destroyHoverListeners = destroyHoverListeners;

  return {
    destroy() {
      actions.destroy?.();
      destroyClickListeners(node);
      destroyHoverListeners(node);
    },
  };

  function createClickListeners(node) {
    if (click) {
      node.addEventListener('click', onClick);
      window.addEventListener('click', onWindowClick);
    }
  }

  function destroyClickListeners() {
    if (click) {
      node.removeEventListener('click', onClick);
      window.removeEventListener('click', onWindowClick);
    }
  }

  function createHoverListeners(node) {
    if (hover) {
      node.addEventListener('mouseenter', onMouseEnter);
      node.addEventListener('mouseleave', onMouseLeave);
    }
  }

  function destroyHoverListeners(node) {
    if (hover) {
      node.removeEventListener('mouseenter', onMouseEnter);
      node.removeEventListener('mouseleave', onMouseLeave);
    }
  }

  function onClick() {
    open = clickOpen = !open;
    if (open) {
      prefetch?.();
      show();
    } else {
      hide();
    }
  }

  function onWindowClick(e) {
    if (open && !(node.contains(e.target) || popoverRef?.contains(e.target))) {
      open = false;
      hide();
    }
  }

  function onMouseEnter() {
    if (clickOpen) {
      return;
    }
    if (waitingToHide) {
      clearTimeout(timeout);
      waitingToHide = false;
    } else {
      waitingToShow = true;
      prefetch?.();
      timeout = setTimeout(() => {
        waitingToShow = false;
        show();
      }, graceMs);
    }
  }

  function onMouseLeave() {
    if (clickOpen) {
      return;
    }
    if (waitingToShow) {
      clearTimeout(timeout);
      waitingToShow = false;
    } else {
      waitingToHide = true;
      timeout = setTimeout(() => {
        waitingToHide = false;
        hide();
      }, graceMs);
    }
  }
}

export function popoverContent(node, popover) {
  const { createHoverListeners, destroyHoverListeners, popperContent, popperOptions } = popover;
  const actions = popperContent(node, popperOptions);
  popover.popoverRef = node;
  createHoverListeners(node);
  return {
    destroy() {
      actions.destroy?.();
      destroyHoverListeners(node);
    },
    update() {
      actions.update?.();
    },
  };
}
