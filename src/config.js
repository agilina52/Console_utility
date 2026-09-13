'use strict';

const path = require('node:path');

if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile(path.join(process.cwd(), '.env'));
  } catch {
    // Файл .env отсутствует — используются значения по умолчанию.
  }
}

const config = {
  timeout: readPositiveInt('WEATHER_TIMEOUT_MS', 5000),
  reportsDir: readString('WEATHER_REPORTS_DIR', 'reports'),
  units: readString('WEATHER_UNITS', 'metric'),
  geocodingUrl: readString(
    'WEATHER_GEOCODING_URL',
    'https://geocoding-api.open-meteo.com/v1/search'
  ),
  forecastUrl: readString('WEATHER_FORECAST_URL', 'https://api.open-meteo.com/v1/forecast'),
};

function readString(key, defaultValue) {
  const value = process.env[key];
  return value === undefined || value === '' ? defaultValue : value;
}

function readPositiveInt(key, defaultValue) {
  const value = Number(process.env[key]);
  return Number.isInteger(value) && value > 0 ? value : defaultValue;
}

module.exports = config;
