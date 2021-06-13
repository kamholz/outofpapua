import { createPopperActions } from 'svelte-popperjs';

const graceMs = 300;

export function createPopover(args = {}) {
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

export function popoverTrigger(node, { activate, hide, popoverRef, popperRef, prefetch, show }) {
  const actions = popperRef(node);
  let timeout;
  let waitingToShow = false;
  let waitingToHide = false;
  let open = false;

  const onMouseEnter = () => {
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
  };
  const onMouseLeave = () => {
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
  };
  const onClick = () => {
    open = !open;
    if (open) {
      prefetch?.();
      show();
    } else {
      hide();
    }
  };
  const onWindowClick = (e) => {
    if (open && !(node.contains(e.target) || popoverRef?.contains(e.target))) {
      open = false;
      hide();
    }
  };

  if (activate === 'hover') {
    node.addEventListener('mouseenter', onMouseEnter);
    node.addEventListener('mouseleave', onMouseLeave);
  } else if (activate === 'click') {
    node.addEventListener('click', onClick);
    window.addEventListener('click', onWindowClick);
  }

  return {
    destroy() {
      actions.destroy?.();

      if (activate === 'hover') {
        node.removeEventListener('mouseenter', onMouseEnter);
        node.removeEventListener('mouseleave', onMouseLeave);
      } else if (activate === 'click') {
        node.removeEventListener('click', onClick);
        window.removeEventListener('click', onWindowClick);
      }
    },
  };
}

export function popoverContent(node, popover) {
  const { popperContent, popperOptions } = popover;
  const actions = popperContent(node, popperOptions);
  popover.popoverRef = node;
  return actions;
}