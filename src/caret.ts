export function caretParts(value: string, position: number): { before: string; character: string; after: string } {
  const index = Math.max(0, Math.min(value.length, position));
  const next = Array.from(value.slice(index))[0];
  const character = !next || next === '\n' ? '\u00a0' : next === ' ' ? '\u00a0' : next;
  return { before: value.slice(0, index), character, after: value.slice(index + (!next || next === '\n' ? 0 : next.length)) };
}

export function installBlockCaret(input: HTMLTextAreaElement): () => void {
  const wrapper = document.querySelector<HTMLElement>('.prompt-input');
  const mirror = document.querySelector<HTMLElement>('#caret-mirror');
  const before = document.querySelector<HTMLElement>('#caret-before');
  const block = document.querySelector<HTMLElement>('#block-caret');
  const after = document.querySelector<HTMLElement>('#caret-after');
  let composing = false;
  const update = () => {
    if (!wrapper || !mirror || !before || !block || !after) return;
    input.dataset.empty = String(!input.value);
    const visible = document.activeElement === input && input.selectionStart === input.selectionEnd && !composing;
    wrapper.dataset.caret = visible ? 'block' : 'native';
    mirror.hidden = !visible;
    if (!visible) return;
    const parts = caretParts(input.value, input.selectionStart);
    before.textContent = parts.before; block.textContent = parts.character; after.textContent = parts.after;
    mirror.style.width = `${input.clientWidth}px`;
    mirror.style.height = `${input.clientHeight}px`;
    mirror.scrollTop = input.scrollTop; mirror.scrollLeft = input.scrollLeft;
  };
  const schedule = () => requestAnimationFrame(update);
  for (const name of ['input', 'focus', 'blur', 'keyup', 'keydown', 'click', 'scroll']) input.addEventListener(name, schedule);
  input.addEventListener('compositionstart', () => { composing = true; update(); });
  input.addEventListener('compositionend', () => { composing = false; schedule(); });
  document.addEventListener('selectionchange', schedule);
  window.addEventListener('resize', schedule);
  update();
  return schedule;
}
