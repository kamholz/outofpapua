export default function (node, { enter, esc }) {
  node.addEventListener('keydown', handleKeyDown);
  return {
    destroy() {
      node.removeEventListener('keydown', handleKeyDown);
    },
  };

  function handleKeyDown(e) {
    if (e.keyCode === 13 && enter) {
      e.preventDefault();
      enter(e);
    } else if (e.keyCode === 27 && esc) {
      e.preventDefault();
      esc(e);
    }
  }
}
