'use strict';

const { getJson } = require('./client');
const { CityNotFoundError } = require('../errors');
const config = require('../config');

/**
 * Получение координат города через геокодинг Open-Meteo.
 *
 * @param {string} city Название города.
 * @returns {Promise<{ name: string, country?: string, admin1?: string,
 *   latitude: number, longitude: number }>}
 */
async function getCoordinates(city) {
  const params = new URLSearchParams({
    name: city,
    count: '1',
    language: 'ru',
    format: 'json',
  });

  const data = await getJson(`${config.geocodingUrl}?${params.toString()}`);

  if (!Array.isArray(data.results) || data.results.length === 0) {
    throw new CityNotFoundError(city);
  }

  const result = data.results[0];
  return {
    name: result.name,
    country: result.country,
    admin1: result.admin1,
    latitude: result.latitude,
    longitude: result.longitude,
  };
}

module.exports = { getCoordinates };
