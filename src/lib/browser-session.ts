import type { AuthConfig } from '../types/index.js';

export interface BrowserSessionOptions {
  browser: 'chrome' | 'firefox';
  timeout?: number;
}

export async function extractSessionFromBrowser(
  _options?: BrowserSessionOptions
): Promise<AuthConfig> {
  // TODO: Implement
  throw new Error('Not implemented');
}
