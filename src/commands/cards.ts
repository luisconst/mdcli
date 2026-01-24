import { Command } from 'commander';
import Table from 'cli-table3';
import chalk from 'chalk';
import { logger } from '../utils/logger.js';
import { fetchAccounts, normalizeAccounts, isCreditCard } from '../lib/api.js';

function formatCurrency(value: number): string {
  const formatted = value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  return value >= 0 ? chalk.green(formatted) : chalk.red(formatted);
}

function formatStatus(active: boolean, closed: boolean): string {
  if (closed) return chalk.red('Closed');
  return active ? chalk.green('Active') : chalk.gray('Inactive');
}

async function listAction(options: { json?: boolean; active?: boolean }): Promise<void> {
  try {
    const response = await fetchAccounts();
    const allAccounts = response.items;
    
    let creditCards = allAccounts.filter(isCreditCard);

    if (options.active) {
      creditCards = creditCards.filter((a) => a.status && !a.encerrada);
    }

    if (options.json) {
      const normalized = normalizeAccounts({ items: creditCards, meta: response.meta });
      console.log(JSON.stringify(normalized, null, 2));
      return;
    }

    const table = new Table({
      head: ['ID', 'Name', 'Bank', 'Limit', 'Next Due', 'Status'],
      style: { head: ['cyan'] },
    });

    for (const card of creditCards) {
      table.push([
        card.id.toString(),
        card.nome,
        card.banco?.nome ?? chalk.gray('-'),
        card.limite ? formatCurrency(card.limite) : chalk.gray('-'),
        card.proximoVencimento ?? chalk.gray('-'),
        formatStatus(card.status, card.encerrada),
      ]);
    }

    logger.header(`Credit Cards (${creditCards.length})`);
    console.log(table.toString());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(message);
    process.exit(1);
  }
}

export const cardsCommand = new Command('cards')
  .description('Manage credit cards');

cardsCommand
  .command('list')
  .description('List all credit cards')
  .option('--json', 'Output as JSON')
  .option('--active', 'Show only active credit cards')
  .action(listAction);
