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
  const { click, hide, hover, popperRef, prefetch, show } = popover;
  let open = false;
  let clickOpen = false;
  let waitingToShow = false;
  let waitingToHide = false;
  let timeout;

  popover.createClickListeners = function (node) {
    if (click) {
      node.addEventListener('click', onClick);
      window.addEventListener('click', onWindowClick);
    }
  };

  popover.destroyClickListeners = function (node) {
    if (click) {
      node.removeEventListener('click', onClick);
      window.removeEventListener('click', onWindowClick);
    }
  };

  popover.createHoverListeners = function (node) {
    if (hover) {
      node.addEventListener('mouseenter', onMouseEnter);
      node.addEventListener('mouseleave', onMouseLeave);
    }
  };

  popover.destroyHoverListeners = function (node) {
    if (hover) {
      node.removeEventListener('mouseenter', onMouseEnter);
      node.removeEventListener('mouseleave', onMouseLeave);
    }
  };

  const actions = popperRef(node);
  popover.createClickListeners(node);
  popover.createHoverListeners(node);

  return {
    destroy() {
      actions.destroy?.();
      popover.destroyClickListeners(node);
      popover.destroyHoverListeners(node);
      hide();
    },
  };

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
    if (open && !(node.contains(e.target) || popover.popoverRef?.contains(e.target))) {
      open = clickOpen = false;
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
  document.body.appendChild(node); // don't inherit local css
  const { createHoverListeners, destroyHoverListeners, popperContent, popperOptions } = popover;
  const actions = popperContent(node, popperOptions);
  popover.popoverRef = node;
  createHoverListeners(node);
  return {
    destroy() {
      actions.destroy?.();
      destroyHoverListeners(node);
      node.remove();
    },
    update() {
      actions.update?.();
    },
  };
}
