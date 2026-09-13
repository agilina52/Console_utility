'use strict';

const { parseArgs } = require('./cli');
const { UsageError } = require('./errors');

/**
 * Точка входа приложения.
 *
 * @param {string[]} argv Аргументы (без node и пути к скрипту).
 * @returns {Promise<number>} Код возврата: 0 — успех, 1 — ошибка.
 */
async function run(argv) {
  let args;
  try {
    args = parseArgs(argv);
  } catch (err) {
    process.stderr.write(`Ошибка: ${err.message}\n`);
    if (err instanceof UsageError) {
      process.stderr.write('Используйте --help для справки.\n');
    }
    return 1;
  }

  if (args.help) {
    printUsage();
    return 0;
  }

  // TODO: получение прогноза и сохранение отчёта (реализуется в следующих ветках).
  return 0;
}

function printUsage() {
  const text = [
    'Использование: node src/index.js --city <города> [опции]',
    '',
    'Получает прогноз погоды из Open-Meteo, выводит в консоль',
    'и сохраняет отчёт в reports/{город}-{ГГГГ-ММ-ДД}.json.',
    '',
    'Опции:',
    '  --city <города>   Обязательный. Один или несколько городов через запятую.',
    '  --days <n>        Количество дней прогноза (1–7, по умолчанию 3).',
    '  --no-cache        Игнорировать сохранённый отчёт и запросить заново.',
    '  -h, --help        Показать эту справку.',
    '',
    'Примеры:',
    '  node src/index.js --city "Нижний Новгород" --days 3',
    '  node src/index.js --city "Москва, Санкт-Петербург"',
    '  node src/index.js --city Лондон --no-cache',
  ].join('\n');
  process.stdout.write(text + '\n');
}

module.exports = { run };

if (require.main === module) {
  run(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  });
}
