'use strict';

const { test } = require('node:test');
const assert = require('node:assert');

const { getJson } = require('../src/api/client');
const { WeatherApiError } = require('../src/errors');

test('HTTP 4xx — WeatherApiError', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({
    ok: false,
    status: 404,
    json: async () => ({}),
  }));

  await assert.rejects(() => getJson('http://example.com'), (err) => {
    assert.ok(err instanceof WeatherApiError);
    assert.match(err.message, /HTTP 404/);
    return true;
  });
});

test('HTTP 5xx — WeatherApiError', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({
    ok: false,
    status: 500,
    json: async () => ({}),
  }));

  await assert.rejects(() => getJson('http://example.com'), (err) => {
    assert.ok(err instanceof WeatherApiError);
    assert.match(err.message, /HTTP 500/);
    return true;
  });
});

test('отсутствие сети — WeatherApiError', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => {
    throw new TypeError('fetch failed');
  });

  await assert.rejects(() => getJson('http://example.com'), (err) => {
    assert.ok(err instanceof WeatherApiError);
    assert.match(err.message, /сеть|запрос/);
    return true;
  });
});

test('некорректный JSON — WeatherApiError', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({
    ok: true,
    status: 200,
    json: async () => {
      throw new SyntaxError('Unexpected token');
    },
  }));

  await assert.rejects(() => getJson('http://example.com'), (err) => {
    assert.ok(err instanceof WeatherApiError);
    assert.match(err.message, /JSON/);
    return true;
  });
});

test('превышение таймаута — WeatherApiError', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url, { signal }) => {
    return new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => {
        const err = new Error('Aborted');
        err.name = 'AbortError';
        reject(err);
      });
    });
  });

  await assert.rejects(() => getJson('http://example.com', { timeout: 10 }), (err) => {
    assert.ok(err instanceof WeatherApiError);
    assert.match(err.message, /таймаут/i);
    return true;
  });
});
