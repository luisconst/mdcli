import { Command } from 'commander';
import { input, password } from '@inquirer/prompts';
import { logger } from '../utils/logger.js';
import { getAuth, setAuth, hasAuth, getConfigPath, getFullConfig } from '../lib/config.js';
import { captureAuthFromBrowser } from '../lib/browser-auth.js';
import type { AuthConfig } from '../types/index.js';

async function promptManualAuth(): Promise<AuthConfig> {
  logger.info('Enter the authentication headers from your browser dev tools:');
  logger.blank();

  const token = await password({
    message: 'Bearer Token (Authorization header value without "Bearer "):',
    mask: '*',
  });

  const apiKey = await input({
    message: 'Mdapikey:',
  });

  const policy = await input({
    message: 'Mdpolicy:',
  });

  const signature = await input({
    message: 'Mdsignature:',
  });

  const uid = await input({
    message: 'Mduid:',
  });

  return { token, apiKey, policy, signature, uid };
}

async function loginAction(options: { manual?: boolean }): Promise<void> {
  try {
    let auth: AuthConfig;

    if (options.manual) {
      auth = await promptManualAuth();
    } else {
      logger.info('Starting browser authentication...');
      auth = await captureAuthFromBrowser();
    }

    setAuth(auth);
    logger.success('Authentication saved successfully!');
    logger.log(`  Config file: ${getConfigPath()}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Authentication failed: ${message}`);
    process.exit(1);
  }
}

function statusAction(): void {
  const configPath = getConfigPath();
  const config = getFullConfig();
  const auth = getAuth();

  logger.header('Authentication Status');

  logger.kv('Config file', configPath);
  logger.kv('Last updated', config.lastUpdated ?? null);
  logger.kv('Authenticated', hasAuth() ? 'Yes' : 'No');

  if (auth) {
    logger.blank();
    logger.kv('Token', auth.token ? `${auth.token.slice(0, 20)}...` : null);
    logger.kv('API Key', auth.apiKey ? `${auth.apiKey.slice(0, 10)}...` : null);
    logger.kv('UID', auth.uid);
  }

  logger.blank();
}

export const authCommand = new Command('auth')
  .description('Manage authentication');

authCommand
  .command('login')
  .description('Authenticate with Meu Dinheiro')
  .option('-m, --manual', 'Manually enter authentication headers')
  .action(loginAction);

authCommand
  .command('status')
  .description('Show current authentication status')
  .action(statusAction);
