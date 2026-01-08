import chalk from 'chalk';

class Logger {
  private debugMode = false;

  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  success(message: string): void {
    console.log(chalk.green('✓'), message);
  }

  warning(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  }

  error(message: string): void {
    console.error(chalk.red('✗'), message);
  }

  debug(message: string): void {
    if (this.debugMode) {
      console.log(chalk.gray('🔍'), chalk.gray(message));
    }
  }

  log(message: string): void {
    console.log(message);
  }

  blank(): void {
    console.log();
  }

  header(title: string): void {
    console.log();
    console.log(chalk.bold.cyan(title));
    console.log(chalk.cyan('─'.repeat(title.length)));
  }

  kv(key: string, value: string | number | boolean | null | undefined): void {
    const displayValue = value === null || value === undefined 
      ? chalk.gray('(not set)') 
      : String(value);
    console.log(`  ${chalk.gray(key + ':')} ${displayValue}`);
  }
}

export const logger = new Logger();
