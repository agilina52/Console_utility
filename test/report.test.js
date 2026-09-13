'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { getReportPath, saveReport, loadReport, reportExists } = require('../src/storage/report');

test('saveReport и loadReport — roundtrip JSON', async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'weather-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));

  const filePath = path.join(dir, 'report.json');
  const report = {
    city: 'Москва',
    days: [{ date: '2026-09-13', minTemperature: 10, maxTemperature: 20, precipitation: 0 }],
  };

  await saveReport(report, filePath);

  assert.strictEqual(await reportExists(filePath), true);
  assert.deepStrictEqual(await loadReport(filePath), report);
});

test('getReportPath содержит имя города и дату', () => {
  const p = getReportPath('Нижний Новгород');
  assert.match(p, /Нижний Новгород-\d{4}-\d{2}-\d{2}\.json/);
});

test('loadReport — некорректный JSON бросает ReportError', async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'weather-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));

  const filePath = path.join(dir, 'bad.json');
  await fs.writeFile(filePath, '{not json', 'utf8');

  await assert.rejects(() => loadReport(filePath), /JSON|кэш/);
});
