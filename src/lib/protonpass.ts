import { $ } from 'bun';

interface ProtonPassCredentials {
  username: string;
  password: string;
  otp: string;
}

export async function getCredentialsFromProtonPass(itemPath: string): Promise<ProtonPassCredentials> {
  try {
    // Proton Pass uses 'email' as the field name for login items.
    // Try 'email' first, fall back to 'username' for compatibility.
    let username: string;
    try {
      username = (await $`pass-cli item view "pass://${itemPath}/email"`.text()).trim();
    } catch {
      username = (await $`pass-cli item view "pass://${itemPath}/username"`.text()).trim();
    }
    const password = (await $`pass-cli item view "pass://${itemPath}/password"`.text()).trim();
    const otp = (await $`pass-cli item view "pass://${itemPath}/totp"`.text()).trim();

    if (!username || !password || !otp) {
      const missing = [];
      if (!username) missing.push('email/username');
      if (!password) missing.push('password');
      if (!otp) missing.push('totp');
      throw new Error(`Missing fields: ${missing.join(', ')}`);
    }

    return { username, password, otp };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to retrieve credentials from Proton Pass: ${message}`);
  }
}
