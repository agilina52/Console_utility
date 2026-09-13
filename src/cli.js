'use strict';

const { UsageError } = require('./errors');

const DEFAULT_DAYS = 3;
const MIN_DAYS = 1;
const MAX_DAYS = 7;

/**
 * Разбор аргументов командной строки.
 *
 * @param {string[]} argv Аргументы (без node и пути к скрипту).
 * @returns {{ help: boolean, cities: string[], days: number, noCache: boolean }}
 */
function parseArgs(argv) {
  let cityValue;
  let days = DEFAULT_DAYS;
  let noCache = false;
  let help = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--help' || arg === '-h') {
      help = true;
      continue;
    }

    if (arg === '--no-cache') {
      noCache = true;
      continue;
    }

    if (arg === '--city') {
      cityValue = takeValue(argv, ++i, '--city');
      continue;
    }
    if (arg.startsWith('--city=')) {
      cityValue = arg.slice('--city='.length);
      continue;
    }

    if (arg === '--days') {
      days = parseDays(takeValue(argv, ++i, '--days'));
      continue;
    }
    if (arg.startsWith('--days=')) {
      days = parseDays(arg.slice('--days='.length));
      continue;
    }

    throw new UsageError(`Неизвестный аргумент: ${arg}`);
  }

  if (help) {
    return { help: true };
  }

  if (cityValue === undefined || cityValue === '') {
    throw new UsageError('Параметр --city обязателен.');
  }

  const cities = cityValue
    .split(',')
    .map((city) => city.trim())
    .filter((city) => city.length > 0);

  if (cities.length === 0) {
    throw new UsageError('Параметр --city должен содержать хотя бы один город.');
  }

  return { help: false, cities, days, noCache };
}

function takeValue(argv, index, option) {
  const value = argv[index];
  if (value === undefined) {
    throw new UsageError(`Опция ${option} требует значение.`);
  }
  return value;
}

function parseDays(value) {
  const days = Number(value);
  if (!Number.isInteger(days) || days < MIN_DAYS || days > MAX_DAYS) {
    throw new UsageError(
      `Параметр --days должен быть целым числом от ${MIN_DAYS} до ${MAX_DAYS}.`
    );
  }
  return days;
}

module.exports = { parseArgs, DEFAULT_DAYS, MIN_DAYS, MAX_DAYS };
