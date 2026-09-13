'use strict';

const config = require('../config');

function formatCityBlock({ report, source }) {
  const lines = [];
  lines.push(`=== ${report.city} ===`);
  lines.push(`Страна: ${report.country || '—'}`);
  lines.push(
    `Координаты: ${report.latitude.toFixed(2)}, ${report.longitude.toFixed(2)}`
  );
  if (source === 'cache') {
    lines.push('Источник: кэш');
  }
  lines.push('');

  const header = ['Дата', 'Мин.', 'Макс.', 'Осадки'];
  const rows = report.days.map((d) => [
    d.date,
    formatTemp(d.minTemperature),
    formatTemp(d.maxTemperature),
    formatPrecip(d.precipitation),
  ]);

  const table = [header, ...rows];
  const widths = header.map((_, col) =>
    Math.max(...table.map((row) => row[col].length))
  );

  lines.push(
    ...table.map((row) =>
      row.map((cell, col) => cell.padEnd(widths[col])).join('   ').trimEnd()
    )
  );

  return lines.join('\n');
}

function formatError(city, message) {
  return `=== ${city} ===\nОшибка: ${message}`;
}

function formatTemp(value) {
  return `${Number(value).toFixed(1)}${temperatureUnit()}`;
}

function formatPrecip(value) {
  return `${Number(value ?? 0).toFixed(1)} ${precipitationUnit()}`;
}

function temperatureUnit() {
  return config.units === 'imperial' ? '°F' : '°C';
}

function precipitationUnit() {
  return config.units === 'imperial' ? 'дюйм' : 'мм';
}

module.exports = { formatCityBlock, formatError };
