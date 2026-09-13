'use strict';

const { test } = require('node:test');
const assert = require('node:assert');

const { getCoordinates } = require('../src/api/geocoding');
const { CityNotFoundError } = require('../src/errors');

test('успешное получение координат', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url) => {
    assert.match(url, /geocoding-api\.open-meteo\.com/);
    assert.match(url, /name=/);
    return {
      ok: true,
      status: 200,
      json: async () => ({
        results: [
          {
            name: 'Москва',
            country: 'Россия',
            admin1: 'Москва',
            latitude: 55.7558,
            longitude: 37.6173,
          },
        ],
      }),
    };
  });

  const result = await getCoordinates('Москва');
  assert.strictEqual(result.name, 'Москва');
  assert.strictEqual(result.latitude, 55.7558);
  assert.strictEqual(result.longitude, 37.6173);
});

test('город не найден — CityNotFoundError', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({
    ok: true,
    status: 200,
    json: async () => ({ results: [] }),
  }));

  await assert.rejects(() => getCoordinates('НетТакогоГорода'), CityNotFoundError);
});
