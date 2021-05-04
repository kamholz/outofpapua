const graceMs = 300;

export default function popover(node, { popperRef, popperOptions, show, hide, prefetch }) {
  const actions = popperRef(node, popperOptions);
  let timeout;
  let waitingToShow = false;
  let waitingToHide = false;

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

  node.addEventListener('mouseenter', onMouseEnter);
  node.addEventListener('mouseleave', onMouseLeave);

  return {
    destroy() {
      actions.destroy?.();
      node.removeEventListener('mouseenter', onMouseEnter);
      node.removeEventListener('mouseleave', onMouseLeave);
    },
  };
}
