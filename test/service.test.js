'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { processCity } = require('../src/services/weather');
const { saveReport, getReportPath } = require('../src/storage/report');
const { CityNotFoundError } = require('../src/errors');

const forecastPayload = {
  daily: {
    time: ['2026-09-13'],
    temperature_2m_min: [10],
    temperature_2m_max: [20],
    precipitation_sum: [0],
  },
};

function mockApi(t) {
  t.mock.method(globalThis, 'fetch', async (url) => {
    if (url.includes('geocoding-api')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          results: [
            { name: 'Москва', country: 'Россия', admin1: 'Москва', latitude: 55.75, longitude: 37.62 },
          ],
        }),
      };
    }
    return { ok: true, status: 200, json: async () => forecastPayload };
  });
}

test('processCity — кэш-попадание без обращения к сети', async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'weather-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));

  await saveReport({ city: 'Москва', days: [] }, getReportPath('Москва', dir));

  t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('сеть не должна использоваться');
  });

  const res = await processCity('Москва', { days: 3, noCache: false, reportsDir: dir });
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.source, 'cache');
});

test('processCity — обращение к API и сохранение отчёта', async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'weather-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  mockApi(t);

  const res = await processCity('Москва', { days: 1, noCache: false, reportsDir: dir });
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.source, 'api');
  assert.strictEqual(res.report.city, 'Москва');
  assert.strictEqual(res.report.days.length, 1);

  const saved = await fs.readFile(getReportPath('Москва', dir), 'utf8');
  assert.match(saved, /Москва/);
});

test('processCity --no-cache игнорирует существующий файл', async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'weather-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  mockApi(t);

  await saveReport({ city: 'Москва', days: [] }, getReportPath('Москва', dir));

  const res = await processCity('Москва', { days: 1, noCache: true, reportsDir: dir });
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.source, 'api');
});

test('processCity — город не найден возвращает ok:false', async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'weather-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));

  t.mock.method(globalThis, 'fetch', async () => ({
    ok: true,
    status: 200,
    json: async () => ({ results: [] }),
  }));

  const res = await processCity('НетТакогоГорода', { days: 3, noCache: true, reportsDir: dir });
  assert.strictEqual(res.ok, false);
  assert.ok(res.error instanceof CityNotFoundError);
});
