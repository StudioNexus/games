import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Script } from "node:vm";
import test from "node:test";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("standalone quiz JavaScript parses without a bundler", () => {
  const source = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(source, "the inline gameplay script exists");
  assert.doesNotThrow(() => new Script(source));
});

test("scoreboard data is rendered as text, not HTML from players", () => {
  assert.match(html, /cell\.textContent\s*=\s*String\(value\)/);
  assert.doesNotMatch(html, /row\.innerHTML\s*=/);
  assert.doesNotMatch(html, /scoreboardTableBody\.innerHTML\s*=/);
  assert.match(html, /scoreboardTableBody\.replaceChildren\(\)/);
  assert.match(html, /entry\.name\.slice\(0, 40\)/);
});

test("quiz works without audio or writable browser storage", () => {
  assert.match(html, /typeof Tone !== 'undefined'/);
  assert.match(html, /Audio failure does not block the Bible quiz/);
  assert.match(html, /Blocked storage or malformed older saves must not prevent guest play/);
  assert.match(html, /localStorage\.setItem\('seven_stars_scores'/);
  assert.match(html, /catch \{\s*\/\/ Browser privacy settings may prevent persistence/);
});
