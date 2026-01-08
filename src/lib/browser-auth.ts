import puppeteer from 'puppeteer';
import type { AuthConfig } from '../types/index.js';

const LOGIN_URL = 'https://app.meudinheiroweb.com.br/';
const API_URL_PATTERN = 'app.meudinheiroweb.com.br/api/v1/';

const REQUIRED_HEADERS = ['authorization', 'mdapikey', 'mdpolicy', 'mdsignature', 'mduid'] as const;

interface CapturedHeaders {
  authorization: string;
  cookie: string;
  mdapikey: string;
  mdpolicy: string;
  mdsignature: string;
  mduid: string;
}

function extractTokenFromAuth(authorization: string): string {
  return authorization.replace(/^Bearer\s+/i, '');
}

function extractTokenFromCookie(cookie: string): string {
  const match = cookie.match(/mdauthtoken0=([^;]+)/);
  return match?.[1] ?? '';
}

function hasAllRequiredHeaders(headers: Record<string, string>): boolean {
  return REQUIRED_HEADERS.every((key) => {
    const value = headers[key];
    return value !== undefined && value !== '';
  });
}

function getMissingHeaders(headers: Record<string, string>): string[] {
  return REQUIRED_HEADERS.filter((key) => {
    const value = headers[key];
    return value === undefined || value === '';
  });
}

function validateCapturedAuth(auth: AuthConfig): string[] {
  const missing: string[] = [];
  if (!auth.token) missing.push('token');
  if (!auth.apiKey) missing.push('apiKey');
  if (!auth.policy) missing.push('policy');
  if (!auth.signature) missing.push('signature');
  if (!auth.uid) missing.push('uid');
  return missing;
}

export async function captureAuthFromBrowser(): Promise<AuthConfig> {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=1280,800'],
    defaultViewport: { width: 1280, height: 800 },
  });

  const page = await browser.newPage();
  await page.setRequestInterception(true);

  let capturedHeaders: CapturedHeaders | null = null;
  let partialCaptures = 0;

  page.on('request', (request) => {
    const url = request.url();

    if (url.includes(API_URL_PATTERN) && !capturedHeaders) {
      const headers = request.headers();
      
      if (hasAllRequiredHeaders(headers)) {
        capturedHeaders = {
          authorization: headers['authorization'],
          cookie: headers['cookie'] ?? '',
          mdapikey: headers['mdapikey'],
          mdpolicy: headers['mdpolicy'],
          mdsignature: headers['mdsignature'],
          mduid: headers['mduid'],
        };
        console.log('✓ All authentication headers captured successfully.');
      } else if (headers['authorization']) {
        partialCaptures++;
        const missing = getMissingHeaders(headers);
        console.log(`⚠ Partial capture #${partialCaptures} - missing: ${missing.join(', ')}`);
      }
    }

    request.continue();
  });

  await page.goto(LOGIN_URL);

  console.log('\n📱 Browser opened. Please log in to Meu Dinheiro.');
  console.log('   The browser will close automatically after capturing all credentials.\n');

  while (!capturedHeaders) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const pages = await browser.pages();
    if (pages.length === 0) {
      throw new Error('Browser was closed before all credentials were captured.');
    }
  }

  await browser.close();

  const result: CapturedHeaders = capturedHeaders;

  const token = result.authorization 
    ? extractTokenFromAuth(result.authorization)
    : extractTokenFromCookie(result.cookie);

  const auth: AuthConfig = {
    token,
    apiKey: result.mdapikey,
    policy: result.mdpolicy,
    signature: result.mdsignature,
    uid: result.mduid,
  };

  const missingFields = validateCapturedAuth(auth);
  if (missingFields.length > 0) {
    throw new Error(`Authentication incomplete. Missing: ${missingFields.join(', ')}`);
  }

  return auth;
}
