'use strict';

const { getJson } = require('./client');
const config = require('../config');

/**
 * Получение прогноза погоды по координатам.
 *
 * @param {number} latitude Широта.
 * @param {number} longitude Долгота.
 * @param {number} days Количество дней прогноза.
 * @returns {Promise<object>} Ответ API с данными о погоде.
 */
async function getForecast(latitude, longitude, days) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
    forecast_days: String(days),
    timezone: 'auto',
    ...temperatureUnits(config.units),
  });

  return getJson(`${config.forecastUrl}?${params.toString()}`);
}

function temperatureUnits(units) {
  if (units === 'imperial') {
    return { temperature_unit: 'fahrenheit', precipitation_unit: 'inch' };
  }
  return { temperature_unit: 'celsius', precipitation_unit: 'mm' };
}

module.exports = { getForecast };
