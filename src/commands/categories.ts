import { Command } from 'commander';
import Table from 'cli-table3';
import chalk from 'chalk';
import { logger } from '../utils/logger.js';
import { fetchCategories, normalizeCategories } from '../lib/api.js';

function formatType(type: string): string {
  const colors: Record<string, typeof chalk.red> = {
    expense: chalk.red,
    income: chalk.green,
    transfer: chalk.blue,
  };
  return (colors[type] ?? chalk.white)(type);
}

function formatBoolean(value: boolean): string {
  return value ? chalk.green('✓') : chalk.gray('✗');
}

async function listAction(options: { json?: boolean; active?: boolean }): Promise<void> {
  try {
    const response = await fetchCategories();
    let categories = normalizeCategories(response);

    if (options.active) {
      categories = categories.filter((c) => c.active);
    }

    if (options.json) {
      console.log(JSON.stringify(categories, null, 2));
      return;
    }

    const table = new Table({
      head: ['ID', 'Name', 'Type', 'Active', 'System'],
      style: { head: ['cyan'] },
    });

    for (const cat of categories) {
      table.push([
        cat.id.toString(),
        cat.name,
        formatType(cat.type),
        formatBoolean(cat.active),
        formatBoolean(cat.system),
      ]);
    }

    logger.header(`Categories (${categories.length})`);
    console.log(table.toString());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(message);
    process.exit(1);
  }
}

export const categoriesCommand = new Command('categories')
  .description('Manage categories');

categoriesCommand
  .command('list')
  .description('List all categories')
  .option('--json', 'Output as JSON')
  .option('--active', 'Show only active categories')
  .action(listAction);
