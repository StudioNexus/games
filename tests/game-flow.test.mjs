import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import test from 'node:test';

function makeElement() {
  const listeners = {};
  return {
    textContent: '', value: '', disabled: false, children: [],
    classList: { add() {}, remove() {} },
    addEventListener(type, callback) { listeners[type] = callback; },
    click() { if (!this.disabled) return listeners.click?.(); },
    appendChild(child) { this.children.push(child); return child; },
    replaceChildren() { this.children = []; },
    querySelectorAll() { return this.children; },
    setAttribute() {},
  };
}

function loadGame() {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const source = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(source);
  const elements = new Map();
  const get = id => {
    if (!elements.has(id)) elements.set(id, makeElement());
    return elements.get(id);
  };
  const timers = [];
  const context = createContext({
    document: { getElementById: get, querySelector: get, createElement: makeElement },
    localStorage: { getItem: () => null, setItem() {} },
    setTimeout: callback => timers.push(callback),
  });
  runInContext(source, context);
  return { get, timers };
}

test('feedback clears between questions and level changes are shown immediately', async () => {
  const { get, timers } = loadGame();
  await get('start-button').click();
  assert.equal(get('level-display').textContent, 'Level: 1');

  for (let question = 0; question < 4; question++) {
    const answers = get('answer-buttons').children;
    assert.equal(answers.length, 4);
    answers[0].click();
    assert.notEqual(get('feedback-message').textContent, '');
    assert.ok(answers.every(answer => answer.disabled));
    timers.shift()();
    if (question < 3) assert.equal(get('feedback-message').textContent, '');
  }

  assert.equal(get('level-display').textContent, 'Level: 2');
  assert.match(get('feedback-message').textContent, /Level 1 Complete/);
  timers.shift()();
  assert.equal(get('feedback-message').textContent, '');
  assert.equal(get('answer-buttons').children.length, 4);
});
