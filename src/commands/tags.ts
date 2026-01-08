import { Command } from 'commander';
import Table from 'cli-table3';
import chalk from 'chalk';
import { logger } from '../utils/logger.js';
import { fetchTags, normalizeTags } from '../lib/api.js';

function formatColor(hex: string): string {
  return chalk.hex(hex)('██') + ' ' + hex;
}

function formatBoolean(value: boolean): string {
  return value ? chalk.green('✓') : chalk.gray('✗');
}

async function listAction(options: { json?: boolean; active?: boolean }): Promise<void> {
  try {
    const response = await fetchTags();
    let tags = normalizeTags(response);

    if (options.active) {
      tags = tags.filter((t) => t.active);
    }

    if (options.json) {
      console.log(JSON.stringify(tags, null, 2));
      return;
    }

    const table = new Table({
      head: ['ID', 'Name', 'Color', 'Active'],
      style: { head: ['cyan'] },
    });

    for (const tag of tags) {
      table.push([
        tag.id.toString(),
        tag.name,
        formatColor(tag.color),
        formatBoolean(tag.active),
      ]);
    }

    logger.header(`Tags (${tags.length})`);
    console.log(table.toString());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(message);
    process.exit(1);
  }
}

export const tagsCommand = new Command('tags')
  .description('Manage tags');

tagsCommand
  .command('list')
  .description('List all tags')
  .option('--json', 'Output as JSON')
  .option('--active', 'Show only active tags')
  .action(listAction);
