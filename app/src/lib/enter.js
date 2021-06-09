export default function (node, handler) {
  node.addEventListener('keydown', handleKeyDown);
  return {
    destroy() {
      node.removeEventListener('keydown', handleKeyDown);
    },
  };

  function handleKeyDown(e) {
    if (e.keyCode === 13) { // enter
      e.preventDefault();
      handler(e);
    }
  }
}
