import { createPopperActions as createPopperActionsOriginal } from 'svelte-popperjs';

const graceMs = 300;

export function createPopperActions() {
  return createPopperActionsOriginal({
    modifiers: [
      { name: 'offset', options: { offset: [0, 8] } },
    ],
  });
}

export function popover(node, { popperRef, popperOptions, popoverRef, activate, show, hide, prefetch }) {
  const actions = popperRef(node, popperOptions);
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
    if (open && !(node.contains(e.target) || popoverRef()?.contains(e.target))) {
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
