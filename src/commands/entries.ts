import { Command } from 'commander';
import Table from 'cli-table3';
import chalk from 'chalk';
import { logger } from '../utils/logger.js';
import { fetchEntries, normalizeEntries } from '../lib/api.js';

const STATUS_FLAGS: Record<string, number> = {
  pending: 1,
  confirmed: 2,
  reconciled: 4,
  scheduled: 8,
};

const TYPE_FLAGS: Record<string, number> = {
  expense: 1,
  income: 2,
  'transfer-out': 4,
  'transfer-in': 8,
};

function parseStatusFilter(input: string): number {
  const num = Number(input);
  if (!Number.isNaN(num) && num >= 0 && num <= 15) return num;

  return input.split(',').reduce((mask, name) => {
    const flag = STATUS_FLAGS[name.trim().toLowerCase()];
    if (!flag) {
      logger.warning(`Unknown status: ${name}. Valid: pending, confirmed, reconciled, scheduled`);
    }
    return mask | (flag ?? 0);
  }, 0);
}

function parseTypeFilter(input: string): number {
  const num = Number(input);
  if (!Number.isNaN(num) && num >= 0 && num <= 15) return num;

  return input.split(',').reduce((mask, name) => {
    const flag = TYPE_FLAGS[name.trim().toLowerCase()];
    if (!flag) {
      logger.warning(`Unknown type: ${name}. Valid: expense, income, transfer-out, transfer-in`);
    }
    return mask | (flag ?? 0);
  }, 0);
}

function formatCurrency(value: number): string {
  const formatted = Math.abs(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  return value >= 0 ? chalk.green(formatted) : chalk.red(formatted);
}

function formatStatus(status: 'reconciled' | 'pending' | 'scheduled'): string {
  const statusConfig = {
    reconciled: { label: 'Reconciled', color: chalk.green },
    pending: { label: 'Pending', color: chalk.yellow },
    scheduled: { label: 'Scheduled', color: chalk.blue },
  };
  const config = statusConfig[status];
  return config.color(config.label);
}

function formatType(type: 'expense' | 'income' | 'transfer'): string {
  const typeConfig = {
    expense: { label: 'Expense', color: chalk.red },
    income: { label: 'Income', color: chalk.green },
    transfer: { label: 'Transfer', color: chalk.cyan },
  };
  const config = typeConfig[type];
  return config.color(config.label);
}

function getDefaultDateRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}

interface ListOptions {
  json?: boolean;
  account?: string;
  from?: string;
  to?: string;
  status?: string;
  type?: string;
  category?: string;
  tag?: string;
  keywords?: string;
  value?: string;
}

async function listAction(options: ListOptions): Promise<void> {
  try {
    const accountIds = options.account ? options.account.split(',').map(Number) : [];

    if (accountIds.length === 0) {
      logger.error('At least one account ID is required. Use --account <id> or --account <id1,id2,...>');
      process.exit(1);
    }

    const { startDate: defaultStart, endDate: defaultEnd } = getDefaultDateRange();

    const categoryIds = options.category ? options.category.split(',').map(Number) : undefined;
    const tagIds = options.tag ? options.tag.split(',').map(Number) : undefined;
    const status = options.status ? parseStatusFilter(options.status) : undefined;
    const entryType = options.type ? parseTypeFilter(options.type) : undefined;
    const value = options.value ? Number(options.value) : undefined;

    const response = await fetchEntries({
      accountIds,
      startDate: options.from ?? defaultStart,
      endDate: options.to ?? defaultEnd,
      categoryIds,
      tagIds,
      keywords: options.keywords,
      value,
      status,
      entryType,
    });

    const entries = normalizeEntries(response);

    if (options.json) {
      console.log(JSON.stringify(entries, null, 2));
      return;
    }

    const table = new Table({
      head: ['Date', 'Description', 'Value', 'Type', 'Status', 'Installment'],
      style: { head: ['cyan'] },
      colWidths: [12, 40, 15, 12, 12, 12],
    });

    for (const entry of entries) {
      table.push([
        entry.date,
        entry.description.length > 37 ? `${entry.description.slice(0, 37)}...` : entry.description,
        formatCurrency(entry.value),
        formatType(entry.type),
        formatStatus(entry.status),
        entry.installment ?? chalk.gray('-'),
      ]);
    }

    const total = entries.reduce((sum, e) => sum + e.value, 0);
    logger.header(`Entries (${entries.length}) | Total: ${formatCurrency(total)}`);
    console.log(table.toString());
    console.log(chalk.gray(`\nPage ${response.meta.page} of ${Math.ceil(response.meta.total / response.meta.pageSize)} (${response.meta.total} total entries)`));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(message);
    process.exit(1);
  }
}

export const entriesCommand = new Command('entries')
  .description('Manage entries (lancamentos)');

entriesCommand
  .command('list')
  .description('List entries for an account')
  .requiredOption('-a, --account <ids>', 'Account ID(s), comma-separated for multiple')
  .option('-f, --from <date>', 'Start date (YYYY-MM-DD), defaults to first day of current month')
  .option('-t, --to <date>', 'End date (YYYY-MM-DD), defaults to last day of current month')
  .option('-s, --status <filter>', 'Filter by status: pending, confirmed, reconciled, scheduled (or bitmask 0-15)')
  .option('-T, --type <filter>', 'Filter by type: expense, income, transfer-out, transfer-in (or bitmask 0-15)')
  .option('-c, --category <ids>', 'Filter by category ID(s), comma-separated')
  .option('-g, --tag <ids>', 'Filter by tag ID(s), comma-separated')
  .option('-k, --keywords <text>', 'Search by keywords')
  .option('-v, --value <amount>', 'Filter by value')
  .option('--json', 'Output as JSON')
  .action(listAction);
