'use strict';

const { WeatherApiError } = require('../errors');
const config = require('../config');

/**
 * GET-запрос с обработкой сетевых ошибок, таймаута (AbortController),
 * HTTP-статусов и некорректного JSON.
 *
 * @param {string} url Адрес запроса.
 * @param {{ timeout?: number }} [options] Настройки запроса.
 * @returns {Promise<object>} Распарсенный JSON-ответ.
 */
async function getJson(url, { timeout = config.timeout } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  let response;
  try {
    response = await fetch(url, { signal: controller.signal });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new WeatherApiError(`Превышен таймаут запроса (${timeout} мс).`);
    }
    throw new WeatherApiError(
      `Отсутствует сеть или не удалось выполнить запрос: ${err.message}`
    );
  } finally {
    clearTimeout(timer);
  }

  if (response.status >= 400 && response.status < 500) {
    throw new WeatherApiError(`API вернул ошибку клиента (HTTP ${response.status}).`);
  }
  if (response.status >= 500) {
    throw new WeatherApiError(`API вернул ошибку сервера (HTTP ${response.status}).`);
  }

  try {
    return await response.json();
  } catch (err) {
    throw new WeatherApiError(`Некорректный JSON в ответе API: ${err.message}`);
  }
}

module.exports = { getJson };
