import { readFile } from 'node:fs/promises';
import { Script } from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';

const source = await readFile(new URL('../dist/experience.js', import.meta.url), 'utf8');

// Small DOM/clock fixture for deterministic behavioral checks, not a substitute
// for the real-browser responsive, focus, and visual checks.
function fixture({ reduced = false, savedMotion = null, storageBlocked = false } = {}) {
  class Node {
    hidden = false;
    disabled = false;
    textContent = '';
    dataset = {};
    attributes = new Map();
    events = new Map();
    classes = new Set();
    style = { setProperty() {}, removeProperty() {} };
    classList = {
      add: name => this.classes.add(name),
      remove: name => this.classes.delete(name),
      contains: name => this.classes.has(name),
      toggle: (name, enabled) => enabled ? this.classes.add(name) : this.classes.delete(name)
    };
    setAttribute(name, value) { this.attributes.set(name, value); }
    getAttribute(name) { return this.attributes.get(name) ?? null; }
    removeAttribute(name) { this.attributes.delete(name); }
    addEventListener(type, callback) {
      this.events.set(type, [...(this.events.get(type) ?? []), callback]);
    }
    emit(type) { this.events.get(type)?.forEach(callback => callback()); }
    click() { this.emit('click'); }
    getBoundingClientRect() { return { bottom: 80 }; }
  }
  const nodes = new Map();
  const get = selector => {
    if (!nodes.has(selector)) nodes.set(selector, new Node());
    return nodes.get(selector);
  };
  const qualityStages = [new Node(), new Node(), new Node()];
  const agentStages = [new Node(), new Node(), new Node()];
  get('#workflow-quality').querySelectorAll = () => qualityStages;
  get('#workflow-agents').querySelectorAll = () => agentStages;
  get('#workflow-agents').hidden = true;
  get('.hero-lab').querySelectorAll = () => [...qualityStages, ...agentStages]
    .filter(node => node.classes.has('is-demo-active'));
  get('.email-option>a').setAttribute('href', 'mailto:rameshganamana799@gmail.com');
  get('.whatsapp-line>a').setAttribute('href', 'https://wa.me/917993897925');
  const topicButtons = ['Test automation', 'Accessibility', 'AI agents'].map(topic => {
    const button = new Node();
    button.dataset.contactTopic = topic;
    button.setAttribute('aria-pressed', 'false');
    return button;
  });
  const modeButtons = [new Node(), new Node()];
  const root = new Node();
  root.scrollHeight = 1600;
  const document = new Node();
  document.documentElement = root;
  document.querySelector = get;
  document.querySelectorAll = selector => selector === '[data-contact-topic]' ? topicButtons
    : selector === '[data-lab]' ? modeButtons : [];
  const motionMedia = new Node();
  motionMedia.matches = reduced;
  const timers = new Map();
  let nextTimer = 0;
  const storage = new Map(savedMotion ? [['rg-motion', savedMotion]] : []);
  const script = new Script(source);
  script.runInNewContext({
    document,
    window: {
      innerHeight: 800, scrollY: 0,
      matchMedia: query => query.includes('prefers-reduced-motion') ? motionMedia : { matches: false },
      addEventListener() {}
    },
    localStorage: {
      getItem(key) { if (storageBlocked) throw Error('Storage unavailable'); return storage.get(key); },
      setItem(key, value) { if (storageBlocked) throw Error('Storage unavailable'); storage.set(key, value); }
    },
    requestAnimationFrame: () => 1,
    cancelAnimationFrame() {},
    setTimeout: (callback, delay) => { timers.set(++nextTimer, { callback, delay }); return nextTimer; },
    clearTimeout: id => timers.delete(id),
    encodeURIComponent
  });
  const finishTimers = () => {
    [...timers].sort((a, b) => a[1].delay - b[1].delay).forEach(([id, item]) => {
      if (!timers.has(id)) return;
      timers.delete(id);
      item.callback();
    });
  };
  return { get, root, timers, finishTimers, modeButtons, motionMedia, storage, topicButtons, document };
}

test('workflow demo completes, ignores duplicate starts, and cancels on mode change', () => {
  const f = fixture();
  const run = f.get('.run-demo');
  assert.equal(f.get('.demo-controls').hidden, false);
  run.click();
  assert.equal(f.get('.hero-lab').dataset.demoState, 'running');
  assert.match(f.get('#demo-status').textContent, /Understand/);
  assert.equal(run.getAttribute('aria-disabled'), 'true');
  assert.equal(f.timers.size, 3);
  run.click();
  assert.equal(f.timers.size, 3);
  f.finishTimers();
  assert.equal(f.get('.hero-lab').dataset.demoState, 'complete');
  assert.match(f.get('#demo-status').textContent, /not a live test/);
  assert.equal(run.getAttribute('aria-disabled'), 'false');
  run.click();
  f.get('#workflow-quality').hidden = true;
  f.get('#workflow-agents').hidden = false;
  f.modeButtons[1].click();
  assert.equal(f.get('.hero-lab').dataset.demoState, 'idle');
  assert.equal(f.timers.size, 0);
  run.click();
  assert.match(f.get('#demo-status').textContent, /Explore a task/);
  f.document.hidden = true;
  f.document.emit('visibilitychange');
  assert.equal(f.timers.size, 0);
  assert.equal(f.get('.hero-lab').dataset.demoState, 'idle');
});

test('reduced motion skips animation timing; manual pause persists', () => {
  const f = fixture({ reduced: true });
  assert.equal(f.root.dataset.motion, 'off');
  assert.equal(f.get('.motion-toggle').disabled, true);
  f.get('.run-demo').click();
  assert.equal(f.get('.hero-lab').dataset.demoState, 'complete');
  assert.equal(f.timers.size, 0);
  f.motionMedia.matches = false;
  f.motionMedia.emit('change');
  assert.equal(f.root.dataset.motion, 'on');
  assert.equal(f.get('.motion-toggle').disabled, false);
  f.get('.motion-toggle').click();
  assert.equal(f.root.dataset.motion, 'off');
  assert.equal(f.storage.get('rg-motion'), 'off');
  assert.equal(fixture({ savedMotion: 'off' }).root.dataset.motion, 'off');
});

test('contact topics exclusively prepare and restore encoded links, even without storage', () => {
  const f = fixture({ storageBlocked: true });
  for (const button of f.topicButtons) {
    button.click();
    assert.equal(f.topicButtons.filter(item => item.getAttribute('aria-pressed') === 'true').length, 1);
    const email = new URL(f.get('.email-option>a').getAttribute('href'));
    const whatsapp = new URL(f.get('.whatsapp-line>a').getAttribute('href'));
    assert.equal(email.searchParams.get('subject'), `Let's discuss ${button.dataset.contactTopic}`);
    assert.match(whatsapp.searchParams.get('text'), new RegExp(button.dataset.contactTopic.toLowerCase()));
    assert.match(f.get('#contact-topic-note').textContent, /nothing has been sent/);
  }
  f.topicButtons.at(-1).click();
  assert.equal(f.get('.email-option>a').getAttribute('href'), 'mailto:rameshganamana799@gmail.com');
  assert.equal(f.get('.whatsapp-line>a').getAttribute('href'), 'https://wa.me/917993897925');
  f.get('.motion-toggle').click();
  assert.equal(f.root.dataset.motion, 'off');
});
