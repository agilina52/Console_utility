'use strict';

const { test } = require('node:test');
const assert = require('node:assert');

const { formatCityBlock, formatError } = require('../src/format/console');

const report = {
  city: 'Нижний Новгород',
  country: 'Россия',
  latitude: 56.33,
  longitude: 44.0,
  date: '2026-09-13',
  days: [
    { date: '2026-09-13', minTemperature: 8.5, maxTemperature: 15.2, precipitation: 1.1 },
  ],
};

test('formatCityBlock содержит город, страну, координаты и таблицу', () => {
  const text = formatCityBlock({ report, source: 'api' });
  assert.match(text, /Нижний Новгород/);
  assert.match(text, /Россия/);
  assert.match(text, /56\.33, 44\.00/);
  assert.match(text, /2026-09-13/);
  assert.match(text, /8\.5°C/);
  assert.match(text, /15\.2°C/);
  assert.match(text, /1\.1 мм/);
});

test('formatCityBlock из кэша содержит пометку', () => {
  const text = formatCityBlock({ report, source: 'cache' });
  assert.match(text, /кэш/);
});

test('formatError содержит город и сообщение', () => {
  const text = formatError('Москва', 'Город не найден');
  assert.match(text, /Москва/);
  assert.match(text, /Город не найден/);
});
