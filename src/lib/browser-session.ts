import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { AuthConfig } from '../types/index.js';

export interface BrowserSessionOptions {
  browser: 'chrome' | 'firefox';
  timeout?: number;
}

const CHROME_PROFILE_PATHS: Record<string, string> = {
  darwin: join(homedir(), 'Library', 'Application Support', 'Google', 'Chrome'),
  win32: join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'User Data'),
  linux: join(homedir(), '.config', 'google-chrome'),
};

export function getChromeProfilePath(): string {
  const platform = process.platform;
  const profilePath = CHROME_PROFILE_PATHS[platform];

  if (!profilePath) {
    throw new Error(`Unsupported platform: ${platform}. Only macOS, Windows, and Linux are supported.`);
  }

  if (!existsSync(profilePath)) {
    throw new Error(`Chrome not found. Expected profile at: ${profilePath}\nTry: mdcli auth login --session firefox or --browser`);
  }

  return profilePath;
}

export async function extractSessionFromBrowser(
  _options?: BrowserSessionOptions
): Promise<AuthConfig> {
  // TODO: Implement
  throw new Error('Not implemented');
}
