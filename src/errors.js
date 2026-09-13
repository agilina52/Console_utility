'use strict';

/**
 * Базовая ошибка приложения.
 */
class AppError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

/** Неверные или отсутствующие аргументы командной строки. */
class UsageError extends AppError {}

/** Ошибка сети, HTTP 4xx/5xx, таймаут или некорректный JSON от API. */
class WeatherApiError extends AppError {}

module.exports = { AppError, UsageError, WeatherApiError };
