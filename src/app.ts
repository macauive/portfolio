import { content } from './content.js';
import { completions, describeCommand, isPortfolioCommand, MAX_HISTORY, MAX_INPUT, recall, remember, resolveCommand, safeHref } from './commands.js';
import { canRecall, cycleSelection, deleteLineStart, insertNewline, searchHistory } from './editor.js';
import { installBlockCaret } from './caret.js';
import { boundedQuestionContext, validateAnswer } from './knowledge.js';
import type { PortfolioAnswer } from './knowledge.js';
import type { QuestionContext } from './server.js';
import type { Draft } from './editor.js';
import type { Project, Response } from './commands.js';

function required<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error('Portfolio could not initialize.');
  return element;
}
const input = required<HTMLTextAreaElement>('#command');
const form = required<HTMLFormElement>('#prompt');
const output = required<HTMLElement>('#output');
const status = required<HTMLElement>('#status');
const suggestions = required<HTMLElement>('#suggestions');
const composer = required<HTMLElement>('.composer');
const commandHint = required<HTMLElement>('.command-hint');
const note = required<HTMLElement>('#prompt-note');
const shortcutPanel = required<HTMLElement>('#shortcut-panel');
const shortcutToggle = required<HTMLButtonElement>('#toggle-shortcuts');
const historyPanel = required<HTMLElement>('#history-search');
const historyQuery = required<HTMLInputElement>('#history-query');
const historyResults = required<HTMLElement>('#history-results');
const historyEmpty = required<HTMLElement>('#history-empty');
const stashButton = required<HTMLButtonElement>('#restore-stash');
const cancelButton = required<HTMLButtonElement>('#cancel-answer');
const renderCaret = installBlockCaret(input);
let history: string[] = [];
let cursor = 0;
let draft = '';
let options: string[] = [];
let completionIndex = -1;
let dismissed = false;
let stash: Draft | undefined;
let clearedDraft: Draft | undefined;
let searchDraft: Draft | undefined;
let historyOptions: string[] = [];
let historyIndex = 0;
let lastEscape = Number.NEGATIVE_INFINITY;
let pendingAnswer: AbortController | undefined;
let pendingBody: HTMLElement | undefined;
let answerContext: QuestionContext[] = [];

function element<K extends keyof HTMLElementTagNameMap>(tag: K, text = '', className = ''): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}

function commandButton(command: string, label = command): HTMLButtonElement {
  const button = element('button', label);
  button.type = 'button';
  button.dataset.command = command;
  return button;
}

function link(label: string, href: string): HTMLElement {
  const safe = safeHref(href);
  if (!safe) return element('span', label);
  const anchor = element('a', label);
  anchor.href = safe;
  if (safe.startsWith('https:')) {
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.setAttribute('aria-label', `${label} (opens in a new tab)`);
  }
  return anchor;
}

function showProject(parent: HTMLElement, project: Project, detail: boolean): void {
  const section = element('section', '', 'project');
  section.append(element('h3', project.title, 'project-title'));
  section.append(element('p', detail ? project.detailedDescription : project.description));
  section.append(element('p', `${project.category} · ${project.technologies.join(' / ')}`, 'project-meta'));
  if (detail) {
    const list = element('ul');
    for (const achievement of project.achievements) list.append(element('li', achievement));
    section.append(list);
  }
  const actions = element('div', '', 'project-actions');
  if (!detail) actions.append(commandButton(`/project ${project.id}`));
  if (project.link) actions.append(link('Visit website ↗', project.link));
  if (actions.childElementCount) section.append(actions);
  parent.append(section);
}

function render(response: Response): HTMLElement {
  const body = element('div', '', 'response');
  switch (response.kind) {
    case 'about':
      body.append(element('h2', `${content.personal.name} · ${content.personal.title}`));
      for (const paragraph of content.about) body.append(element('p', paragraph));
      body.append(element('p', content.personal.location));
      body.append(commandButton('/contact', '/contact → let’s connect'));
      break;
    case 'help': {
      body.append(element('h2', 'Portfolio commands'));
      const list = element('div', '', 'command-list');
      for (const [command, description] of [
        ['/about', 'Meet Iver. /home is an alias.'], ['/projects', 'Mac Digital, Drop It, and Amountly.'],
        ['/project mac-digital', 'Project details. Use a slug or full project name.'], ['/work', 'Selected automation, integrations, and analytics work.'],
        ['/skills', 'Languages, frameworks, and platforms.'], ['/contact', 'Email and GitHub.'], ['/history', 'Search commands from this session.'], ['/clear', 'Clear the displayed output.'],
      ]) list.append(commandButton(command), element('span', description));
      body.append(list);
      body.append(element('p', 'You can also ask normal questions about Iver and his projects. You can ask simple everyday questions too. Facts about Iver come from his portfolio, and replies are checked before display. If a detail is missing, the guide says so. Example: Which projects use Python?'));
      body.append(element('p', 'Type / for the command picker. ↑ / ↓ choose a suggestion; Tab inserts it; Enter runs it. Shift+Enter adds a line. With the picker closed, ↑ / ↓ recall commands and restore your draft.'));
      body.append(element('p', 'Type ? in an empty prompt for shortcut help. Escape closes a panel; double Escape clears a draft. Ctrl+R searches this session’s history. Ctrl+S stashes or restores your draft; Ctrl+U deletes to the start of the current line; Ctrl+C clears an unselected prompt.'));
      body.append(element('p', 'Bare-word aliases: help, about, home, projects, work, skills, contact, history, clear. History stays in this tab until reload; the latest 40 commands and responses are kept. These commands browse portfolio content.'));
      break;
    }
    case 'projects':
    case 'work': {
      body.append(element('h2', response.kind === 'projects' ? 'Selected products' : 'Selected work'));
      const ids = response.kind === 'projects' ? content.productIds : content.workIds;
      for (const id of ids) {
        const project = content.projects.find(item => item.id === id);
        if (project) showProject(body, project, false);
      }
      break;
    }
    case 'project':
      showProject(body, response.project, true);
      break;
    case 'skills': {
      body.append(element('h2', 'Skills'));
      const groups = new Map<string, string[]>();
      for (const skill of content.skills) groups.set(skill.category, [...(groups.get(skill.category) ?? []), skill.name]);
      const labels: Record<string, string> = { language: 'Languages', framework: 'Frameworks', platform: 'Platforms', tool: 'Tools' };
      for (const [category, names] of groups) {
        const group = element('section', '', 'skill-group');
        group.append(element('h3', labels[category] ?? category), element('p', names.join(' · ')));
        body.append(group);
      }
      break;
    }
    case 'contact':
      body.append(element('h2', 'Let’s connect'));
      body.append(element('p', 'For thoughtful conversations about automation, integrations, analytics, or practical internal tools, reach out via email or GitHub.'));
      body.append(element('p', content.personal.location));
      body.append(link(content.personal.email, `mailto:${content.personal.email}`));
      body.append(element('br'));
      body.append(link(content.personal.github, `https://${content.personal.github}`));
      break;
    case 'error':
      body.append(element('p', response.message), commandButton('/help'));
      break;
    case 'clear':
      break;
    case 'history':
      body.append(element('p', 'Search session history below. Choose a match to restore it to the prompt.'));
      break;
  }
  return body;
}

function hideSuggestions(): void {
  suggestions.hidden = true;
  input.setAttribute('aria-expanded', 'false');
  input.removeAttribute('aria-activedescendant');
}

function keepOptionVisible(container: HTMLElement, option: HTMLElement | null): void {
  if (!option) return;
  const parent = container.getBoundingClientRect();
  const child = option.getBoundingClientRect();
  if (child.top < parent.top) container.scrollTop -= parent.top - child.top;
  else if (child.bottom > parent.bottom) container.scrollTop += child.bottom - parent.bottom;
}

function showSuggestions(): void {
  suggestions.replaceChildren();
  if (!options.length || dismissed) { hideSuggestions(); return; }
  for (const [index, option] of options.entries()) {
    const button = element('button', '', index === completionIndex ? 'selected' : '');
    button.type = 'button';
    button.id = `command-option-${index}`;
    button.setAttribute('role', 'option');
    button.setAttribute('aria-selected', String(index === completionIndex));
    button.tabIndex = -1;
    button.dataset.completion = option;
    button.append(element('span', option, 'suggestion-name'), element('span', describeCommand(option, content), 'suggestion-description'));
    suggestions.append(button);
  }
  suggestions.hidden = false;
  input.setAttribute('aria-expanded', 'true');
  input.setAttribute('aria-activedescendant', `command-option-${completionIndex}`);
  keepOptionVisible(suggestions, suggestions.querySelector<HTMLElement>('.selected'));
}

function resetCompletion(): void {
  dismissed = false;
  options = completions(input.value, content);
  completionIndex = options.length ? 0 : -1;
  showSuggestions();
}

function currentDraft(): Draft {
  return { value: input.value, start: input.selectionStart, end: input.selectionEnd };
}

function resizePrompt(): void {
  input.rows = 1;
  const lineHeight = Number.parseFloat(window.getComputedStyle(input).lineHeight) || 24;
  input.rows = Math.max(1, Math.min(6, Math.round((input.scrollHeight - 6) / lineHeight)));
  renderCaret();
}

function renderAnswer(answer: PortfolioAnswer): HTMLElement {
  const body = element('div', '', 'response');
  body.append(element('p', answer.answer, 'answer-text'));
  return body;
}

function loadingAnswer(): HTMLElement {
  const row = element('p', '', 'answer-loading');
  const spinner = element('span', '✦', 'thinking-spinner');
  spinner.setAttribute('aria-hidden', 'true');
  row.append(spinner, element('span', 'Thinking…'));
  return row;
}

async function revealAnswer(text: HTMLElement, answer: string, signal: AbortSignal): Promise<void> {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const characters = Array.from(answer);
  text.textContent = '';
  text.classList.add('answer-revealing');
  await new Promise<void>(resolve => {
    let frame = 0;
    let start: number | undefined;
    const stop = () => { cancelAnimationFrame(frame); text.classList.remove('answer-revealing'); signal.removeEventListener('abort', stop); resolve(); };
    const tick = (stamp: number) => {
      if (signal.aborted || !text.isConnected) { stop(); return; }
      start ??= stamp;
      const count = Math.min(characters.length, Math.max(1, Math.ceil((stamp - start) / Math.min(2400, characters.length * 5) * characters.length)));
      text.textContent = characters.slice(0, count).join('');
      if (count === characters.length) { stop(); return; }
      frame = requestAnimationFrame(tick);
    };
    signal.addEventListener('abort', stop, { once: true });
    frame = requestAnimationFrame(tick);
  });
}

function stopAnswer(): void {
  if (!pendingAnswer) return;
  pendingAnswer.abort();
  pendingBody?.replaceChildren(element('p', 'Answer stopped. Ask another question whenever you’re ready.', 'answer-state'));
  pendingAnswer = undefined;
  pendingBody = undefined;
  cancelButton.hidden = true;
  note.textContent = '';
  status.textContent = 'Answer stopped. Your draft is preserved.';
  output.querySelectorAll('[aria-busy="true"]').forEach(node => node.removeAttribute('aria-busy'));
}

class AnswerError extends Error {}

async function answerQuestion(question: string, entry: HTMLElement, body: HTMLElement): Promise<void> {
  const controller = new AbortController();
  pendingAnswer = controller;
  pendingBody = body;
  cancelButton.hidden = false;
  note.textContent = 'Thinking…';
  entry.setAttribute('aria-busy', 'true');
  status.textContent = 'Thinking about your question.';
  const timeout = window.setTimeout(() => controller.abort(), 65000);
  try {
    const result = await fetch('/api/answer', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question, context: boundedQuestionContext(question, answerContext) }), signal: controller.signal });
    if (!result.ok) throw new AnswerError(result.status === 429 ? 'The question limit has been reached. Try again later; portfolio commands still work.' : 'The answer service is unavailable right now. You can still explore with /projects.');
    const answer = validateAnswer(await result.json());
    if (!answer) throw new AnswerError('I couldn’t check that reply. Please try again.');
    if (controller.signal.aborted || !entry.isConnected) return;
    window.clearTimeout(timeout);
    const rendered = renderAnswer(answer);
    body.replaceWith(rendered);
    pendingBody = rendered;
    note.textContent = 'Responding…';
    status.textContent = 'Answer checked. Responding.';
    await revealAnswer(rendered.querySelector<HTMLElement>('.answer-text')!, answer.answer, controller.signal);
    if (controller.signal.aborted || pendingAnswer !== controller || !entry.isConnected) return;
    answerContext = [...answerContext, { question, answer: answer.answer.slice(0, 1200), sourceIds: [...new Set(answer.sources.map(source => source.id))] }].slice(-4);
    status.textContent = ['answered', 'general'].includes(answer.status) ? 'Answer ready.' : answer.answer;
  } catch (failure) {
    if (pendingAnswer !== controller || !entry.isConnected) return;
    const message = controller.signal.aborted ? 'The answer request timed out. Try again, or explore with /projects.' : failure instanceof AnswerError ? failure.message : 'Answers are unavailable right now. Portfolio commands still work.';
    answerContext = [...answerContext, { question, answer: message.slice(0, 1200), sourceIds: [] }].slice(-4);
    pendingBody?.replaceChildren(element('p', message, 'answer-state'));
    status.textContent = message;
  } finally {
    window.clearTimeout(timeout);
    entry.removeAttribute('aria-busy');
    if (pendingAnswer === controller) { pendingAnswer = undefined; pendingBody = undefined; cancelButton.hidden = true; note.textContent = ''; }
  }
}

function setDraft(next: Draft): void {
  input.value = next.value.slice(0, MAX_INPUT);
  input.setSelectionRange(Math.min(next.start, input.value.length), Math.min(next.end, input.value.length));
  draft = input.value;
  cursor = history.length;
  resizePrompt();
}

function closeShortcuts(): void {
  shortcutPanel.hidden = true;
  shortcutToggle.setAttribute('aria-expanded', 'false');
}

function toggleShortcuts(): void {
  const opening = shortcutPanel.hidden;
  hideSuggestions();
  dismissed = true;
  shortcutPanel.hidden = !opening;
  shortcutToggle.setAttribute('aria-expanded', String(opening));
  status.textContent = opening ? 'Keyboard shortcuts expanded below the prompt.' : 'Keyboard shortcuts closed.';
}

function refreshHistory(): void {
  historyOptions = searchHistory(history, historyQuery.value);
  historyIndex = Math.max(0, Math.min(historyIndex, historyOptions.length - 1));
  historyResults.replaceChildren();
  for (const [index, command] of historyOptions.entries()) {
    const option = element('button', command, index === historyIndex ? 'selected' : '');
    option.type = 'button';
    option.id = `history-option-${index}`;
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', String(index === historyIndex));
    option.tabIndex = -1;
    option.dataset.history = String(index);
    historyResults.append(option);
  }
  historyEmpty.hidden = historyOptions.length !== 0;
  if (historyOptions.length) historyQuery.setAttribute('aria-activedescendant', `history-option-${historyIndex}`);
  else historyQuery.removeAttribute('aria-activedescendant');
  keepOptionVisible(historyResults, historyResults.querySelector<HTMLElement>('.selected'));
}

function openHistory(): void {
  if (historyPanel.hidden) {
    searchDraft = currentDraft();
    historyQuery.value = '';
    historyIndex = 0;
    hideSuggestions();
    closeShortcuts();
    dismissed = true;
    historyPanel.hidden = false;
    refreshHistory();
  }
  historyQuery.focus({ preventScroll: true });
  status.textContent = `${historyOptions.length} commands in this session’s history. Type to filter.`;
}

function closeHistory(accept = false): void {
  if (historyPanel.hidden) return;
  const match = accept ? historyOptions[historyIndex] : undefined;
  historyPanel.hidden = true;
  if (match !== undefined) setDraft({ value: match, start: match.length, end: match.length });
  else if (searchDraft) setDraft(searchDraft);
  searchDraft = undefined;
  input.focus({ preventScroll: true });
  status.textContent = match !== undefined ? 'Command restored. Press Enter to run it.' : 'History search closed. Your draft is preserved.';
}

function acceptCompletion(option: string, submit: boolean): void {
  const value = option === '/project' ? '/project ' : option;
  setDraft({ value, start: value.length, end: value.length });
  if (option === '/project') {
    resetCompletion();
    status.textContent = 'Choose a project with the arrow keys, Tab, or Enter.';
  } else {
    dismissed = true;
    hideSuggestions();
    if (submit) run(value, true);
    else status.textContent = `Inserted ${value}. Press Enter to run.`;
  }
}

function clearDraft(): void {
  if (!input.value) return;
  clearedDraft = currentDraft();
  setDraft({ value: '', start: 0, end: 0 });
  dismissed = true;
  hideSuggestions();
  note.textContent = '';
  status.textContent = 'Draft cleared. Up arrow restores it while the prompt is empty.';
}

function toggleStash(): void {
  if (input.value) {
    stash = currentDraft();
    setDraft({ value: '', start: 0, end: 0 });
    status.textContent = 'Draft stashed. Ctrl+S restores it into an empty prompt.';
  } else if (stash) {
    setDraft(stash);
    stash = undefined;
    status.textContent = 'Stashed draft restored.';
  }
  stashButton.hidden = !stash;
  dismissed = true;
  hideSuggestions();
  note.textContent = '';
}

function run(raw: string, focusPrompt: boolean): void {
  if (!raw.trim()) return;
  const command = raw.trim();
  if (command.length > MAX_INPUT) { status.textContent = 'Keep questions under 1201 characters.'; return; }
  const isCommand = isPortfolioCommand(command);
  if (!isCommand && pendingAnswer) { status.textContent = 'An answer is in progress. Press Escape to stop it before asking another question.'; return; }
  commandHint.hidden = true;
  const response = isCommand ? resolveCommand(command, content) : undefined;
  history = remember(history, command);
  cursor = history.length;
  draft = '';
  clearedDraft = undefined;
  input.value = '';
  resizePrompt();
  options = [];
  completionIndex = -1;
  hideSuggestions();
  closeShortcuts();
  historyPanel.hidden = true;
  searchDraft = undefined;
  note.textContent = '';
  if (response?.kind === 'clear') {
    stopAnswer();
    answerContext = [];
    output.replaceChildren();
    status.textContent = 'Command output cleared. Previous commands remain available with arrow keys.';
  } else {
    const entry = element('article', '', 'entry');
    const body = response ? render(response) : element('div', '', 'response');
    if (!response) body.append(loadingAnswer());
    entry.append(element('p', `❯ ${command.slice(0, MAX_INPUT)}`, 'entry-command'), body);
    output.append(entry);
    while (output.childElementCount > MAX_HISTORY) output.firstElementChild?.remove();
    if (response) status.textContent = response.kind === 'error' ? response.message : `${response.kind === 'project' ? response.project.title : response.kind} displayed in command history.`;
    else void answerQuestion(command, entry, body);
    // Scroll only after a submission. Long responses start at their first line;
    // ordinary browsing and focus changes do not pull the page to the prompt.
    requestAnimationFrame(() => {
      const bounds = entry.getBoundingClientRect();
      const available = window.innerHeight - composer.offsetHeight - 20;
      if (bounds.bottom > available) {
        if (bounds.height > available) entry.scrollIntoView({ block: 'start', behavior: 'instant' });
        else window.scrollBy({ top: bounds.bottom - available, behavior: 'instant' });
      }
    });
  }
  if (focusPrompt) input.focus({ preventScroll: true });
  if (response?.kind === 'history') openHistory();
}

form.addEventListener('submit', event => {
  event.preventDefault();
  run(input.value, true);
});
input.addEventListener('input', () => {
  cursor = history.length;
  draft = input.value;
  clearedDraft = undefined;
  note.textContent = '';
  lastEscape = Number.NEGATIVE_INFINITY;
  closeShortcuts();
  resizePrompt();
  resetCompletion();
});
input.addEventListener('keydown', event => {
  if (event.isComposing) return;
  if (event.ctrlKey && !event.metaKey && !event.altKey) {
    const key = event.key.toLowerCase();
    if (key === 'r') { event.preventDefault(); openHistory(); return; }
    if (key === 's') { event.preventDefault(); toggleStash(); return; }
    if (key === 'u') { event.preventDefault(); setDraft(deleteLineStart(currentDraft())); note.textContent = ''; resetCompletion(); status.textContent = 'Deleted to the start of the current line.'; return; }
    if (key === 'c' && input.selectionStart === input.selectionEnd) { event.preventDefault(); clearDraft(); return; }
    return;
  }
  if (event.metaKey) return;
  if (event.key === '?' && !input.value) { event.preventDefault(); toggleShortcuts(); return; }
  if (event.key !== 'Escape') { lastEscape = Number.NEGATIVE_INFINITY; note.textContent = ''; }
  if (event.key === 'Enter') {
    event.preventDefault();
    const backslash = input.selectionStart === input.selectionEnd && input.value[input.selectionStart - 1] === '\\';
    if (event.shiftKey || event.altKey || backslash) {
      setDraft(insertNewline(currentDraft(), backslash && !event.shiftKey && !event.altKey));
      dismissed = true;
      hideSuggestions();
    } else if (!suggestions.hidden && options.length) acceptCompletion(options[completionIndex], true);
    else run(input.value, true);
    return;
  }
  if (event.altKey) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    if (pendingAnswer) stopAnswer();
    else if (!shortcutPanel.hidden) { closeShortcuts(); status.textContent = 'Shortcuts closed.'; }
    else if (!suggestions.hidden) { dismissed = true; hideSuggestions(); lastEscape = performance.now(); status.textContent = 'Suggestions dismissed.'; }
    else if (input.value) {
      const now = performance.now();
      if (now - lastEscape < 650) { clearDraft(); lastEscape = Number.NEGATIVE_INFINITY; }
      else { lastEscape = now; note.textContent = 'Esc again to clear draft'; status.textContent = 'Press Escape again to clear the draft.'; }
    }
  } else if (event.key === 'Tab' && !event.shiftKey && !dismissed && options.length) {
    event.preventDefault();
    acceptCompletion(options[completionIndex], false);
  } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    const direction = event.key === 'ArrowUp' ? -1 : 1;
    if (!suggestions.hidden && options.length) {
      event.preventDefault();
      completionIndex = cycleSelection(completionIndex, direction, options.length);
      showSuggestions();
    } else if (direction < 0 && !input.value && clearedDraft) {
      event.preventDefault(); setDraft(clearedDraft); clearedDraft = undefined;
    } else if (history.length && canRecall(input.value, input.selectionStart, input.selectionEnd, direction)) {
      event.preventDefault();
      if (cursor === history.length) draft = input.value;
      const result = recall(history, cursor, direction, draft);
      cursor = result.index;
      input.value = result.value;
      dismissed = true;
      hideSuggestions();
      resizePrompt();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }
});

historyQuery.addEventListener('input', () => { historyIndex = 0; refreshHistory(); });
historyQuery.addEventListener('keydown', event => {
  if (event.isComposing) return;
  if (event.key === 'Escape') { event.preventDefault(); closeHistory(); }
  else if (event.key === 'Enter' || (event.key === 'Tab' && !event.shiftKey && historyOptions.length)) { event.preventDefault(); closeHistory(true); }
  else if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || (event.ctrlKey && event.key.toLowerCase() === 'r')) {
    event.preventDefault();
    historyIndex = cycleSelection(historyIndex, event.key === 'ArrowUp' ? -1 : 1, historyOptions.length);
    refreshHistory();
  }
});
shortcutToggle.addEventListener('click', toggleShortcuts);
required<HTMLButtonElement>('#open-history').addEventListener('click', openHistory);
required<HTMLButtonElement>('#close-history').addEventListener('click', () => closeHistory());
stashButton.addEventListener('click', () => {
  if (input.value) { status.textContent = 'Clear the current prompt before restoring your stashed draft.'; return; }
  toggleStash();
  input.focus({ preventScroll: true });
});
cancelButton.addEventListener('click', stopAnswer);
window.addEventListener('resize', resizePrompt);
input.addEventListener('focus', () => { if (!historyPanel.hidden) closeHistory(); });
document.addEventListener('keydown', event => {
  if (event.defaultPrevented || event.isComposing || event.key !== 'Escape') return;
  if (pendingAnswer) { event.preventDefault(); stopAnswer(); }
  else if (!historyPanel.hidden) { event.preventDefault(); closeHistory(); }
  else if (!shortcutPanel.hidden) { event.preventDefault(); closeShortcuts(); input.focus({ preventScroll: true }); }
});

document.addEventListener('click', event => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest<HTMLButtonElement>('button');
  if (button?.dataset.command) run(button.dataset.command, window.matchMedia('(pointer: fine)').matches);
  if (button?.dataset.question) run(button.dataset.question, window.matchMedia('(pointer: fine)').matches);
  if (button?.dataset.completion) {
    acceptCompletion(button.dataset.completion, false);
    input.focus({ preventScroll: true });
  }
  if (button?.dataset.history) {
    const index = Number(button.dataset.history);
    if (Number.isInteger(index) && index >= 0 && index < historyOptions.length) { historyIndex = index; closeHistory(true); }
  }
});
