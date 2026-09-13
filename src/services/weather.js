'use strict';

const { getCoordinates } = require('../api/geocoding');
const { getForecast } = require('../api/forecast');
const { getReportPath, reportExists, loadReport, saveReport, today } = require('../storage/report');
const config = require('../config');

/**
 * Обработка одного города: кэш → (геокодинг → прогноз → сохранение).
 * Ошибки перехватываются и возвращаются как результат, не пробрасываются,
 * чтобы один город не прерывал обработку остальных.
 *
 * @param {string} city Название города.
 * @param {{ days: number, noCache: boolean, reportsDir?: string }} options
 * @returns {Promise<{ city: string, ok: boolean, report?: object,
 *   source?: string, filePath?: string, error?: Error }>}
 */
async function processCity(city, { days, noCache, reportsDir = config.reportsDir } = {}) {
  const filePath = getReportPath(city, reportsDir);

  try {
    if (!noCache && (await reportExists(filePath))) {
      const report = await loadReport(filePath);
      return { city, ok: true, report, source: 'cache', filePath };
    }

    const location = await getCoordinates(city);
    const forecast = await getForecast(location.latitude, location.longitude, days);

    const report = buildReport(location, forecast);
    const savedPath = await saveReport(report, filePath);

    return { city, ok: true, report, source: 'api', filePath: savedPath };
  } catch (err) {
    return { city, ok: false, error: err };
  }
}

function buildReport(location, forecast) {
  const daily = forecast.daily;
  return {
    city: location.name,
    country: location.country || '',
    latitude: location.latitude,
    longitude: location.longitude,
    date: today(),
    days: daily.time.map((date, i) => ({
      date,
      minTemperature: daily.temperature_2m_min[i],
      maxTemperature: daily.temperature_2m_max[i],
      precipitation: daily.precipitation_sum[i] ?? 0,
    })),
  };
}

module.exports = { processCity, buildReport };
