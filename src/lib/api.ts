import type { 
  ApiHeaders, 
  AuthConfig, 
  CategoriesResponse, 
  AccountsResponse, 
  TagsResponse,
  NormalizedCategory,
  NormalizedAccount,
  NormalizedTag
} from '../types/index.js';
import { getAuth } from './config.js';

const BASE_URL = 'https://app.meudinheiroweb.com.br/api/v1';

function buildHeaders(auth: AuthConfig): ApiHeaders {
  return {
    Authorization: `Bearer ${auth.token}`,
    Cookie: `mdauthtoken0=${auth.token}`,
    Mdapikey: auth.apiKey,
    Mdpolicy: auth.policy,
    Mdsignature: auth.signature,
    Mduid: auth.uid,
  };
}

async function apiRequest<T>(endpoint: string): Promise<T> {
  const auth = getAuth();
  if (!auth) {
    throw new Error('Not authenticated. Run "mdcli auth login" first.');
  }

  const headers = buildHeaders(auth);
  const url = `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: headers as unknown as Record<string, string>,
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication expired. Run "mdcli auth login" to re-authenticate.');
    }
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchCategories(): Promise<CategoriesResponse> {
  return apiRequest<CategoriesResponse>('/cadastros/categorias?meta=true&paginate=false');
}

export async function fetchAccounts(): Promise<AccountsResponse> {
  return apiRequest<AccountsResponse>('/cadastros/contas?meta=true&paginate=false');
}

export async function fetchTags(): Promise<TagsResponse> {
  return apiRequest<TagsResponse>('/cadastros/tags?paginate=false');
}

function mapCategoryType(tipo: 'd' | 'r' | 't'): 'expense' | 'income' | 'transfer' {
  const typeMap: Record<string, 'expense' | 'income' | 'transfer'> = {
    d: 'expense',
    r: 'income',
    t: 'transfer',
  };
  return typeMap[tipo] ?? 'expense';
}

export function normalizeCategories(response: CategoriesResponse): NormalizedCategory[] {
  return response.items.map((cat) => ({
    id: cat.id,
    name: cat.nome,
    type: mapCategoryType(cat.tipo),
    active: cat.status,
    system: cat.sistema,
  }));
}

export function normalizeAccounts(response: AccountsResponse): NormalizedAccount[] {
  return response.items.map((acc) => ({
    id: acc.id,
    name: acc.nome,
    type: acc.tipo,
    bank: acc.banco?.nome ?? null,
    balance: acc.saldoUltimoExtrato ?? acc.saldoInicial ?? 0,
    active: acc.status,
    closed: acc.encerrada,
  }));
}

export function normalizeTags(response: TagsResponse): NormalizedTag[] {
  return response.map((tag) => ({
    id: tag.id,
    name: tag.nome,
    color: `#${tag.cor}`,
    active: tag.status,
  }));
}
