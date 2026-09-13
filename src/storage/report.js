'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const { ReportError } = require('../errors');
const config = require('../config');

/**
 * Путь к отчёту города за текущую дату.
 *
 * @param {string} city Название города.
 * @param {string} [baseDir] Каталог отчётов.
 * @returns {string} Путь вида reports/{город}-{ГГГГ-ММ-ДД}.json.
 */
function getReportPath(city, baseDir = config.reportsDir) {
  return path.join(baseDir, `${sanitize(city)}-${today()}.json`);
}

async function reportExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function loadReport(filePath) {
  let raw;
  try {
    raw = await fs.readFile(filePath, 'utf8');
  } catch (err) {
    throw new ReportError(`Не удалось прочитать кэш ${filePath}: ${err.message}`);
  }

  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new ReportError(`Некорректный JSON в кэше ${filePath}. Используйте --no-cache.`);
  }
}

async function saveReport(report, filePath) {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(report, null, 2) + '\n', 'utf8');
  } catch (err) {
    throw new ReportError(`Не удалось сохранить отчёт ${filePath}: ${err.message}`);
  }
  return path.resolve(filePath);
}

function today() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function sanitize(city) {
  return city.trim().replace(/[<>:"/\\|?*\r\n]/g, '_');
}

module.exports = {
  getReportPath,
  reportExists,
  loadReport,
  saveReport,
  today,
  sanitize,
};
