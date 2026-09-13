'use strict';

const { test } = require('node:test');
const assert = require('node:assert');

const { parseArgs, DEFAULT_DAYS } = require('../src/cli');
const { UsageError } = require('../src/errors');

test('обязательный --city с одним городом, --days по умолчанию 3', () => {
  const args = parseArgs(['--city', 'Нижний Новгород']);
  assert.deepStrictEqual(args.cities, ['Нижний Новгород']);
  assert.strictEqual(args.days, DEFAULT_DAYS);
  assert.strictEqual(args.noCache, false);
});

test('несколько городов через запятую', () => {
  const args = parseArgs(['--city', 'Москва, Санкт-Петербург,Лондон']);
  assert.deepStrictEqual(args.cities, ['Москва', 'Санкт-Петербург', 'Лондон']);
});

test('--days и --no-cache', () => {
  const args = parseArgs(['--city', 'Москва', '--days', '5', '--no-cache']);
  assert.strictEqual(args.days, 5);
  assert.strictEqual(args.noCache, true);
});

test('форма --city=X и --days=X', () => {
  const args = parseArgs(['--city=Москва', '--days=7']);
  assert.deepStrictEqual(args.cities, ['Москва']);
  assert.strictEqual(args.days, 7);
});

test('--help возвращает help', () => {
  assert.strictEqual(parseArgs(['--help']).help, true);
});

test('без --city — UsageError', () => {
  assert.throws(() => parseArgs([]), UsageError);
});

test('пустой --city — UsageError', () => {
  assert.throws(() => parseArgs(['--city', '']), UsageError);
});

test('неизвестный аргумент — UsageError', () => {
  assert.throws(() => parseArgs(['--city', 'Москва', '--foo']), UsageError);
});

test('--days вне диапазона 1–7 — UsageError', () => {
  assert.throws(() => parseArgs(['--city', 'Москва', '--days', '0']), UsageError);
  assert.throws(() => parseArgs(['--city', 'Москва', '--days', '8']), UsageError);
  assert.throws(() => parseArgs(['--city', 'Москва', '--days', 'abc']), UsageError);
});
