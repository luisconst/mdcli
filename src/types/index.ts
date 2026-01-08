export interface AuthConfig {
  token: string;
  apiKey: string;
  policy: string;
  signature: string;
  uid: string;
}

export interface ApiHeaders {
  Authorization: string;
  Cookie: string;
  Mdapikey: string;
  Mdpolicy: string;
  Mdsignature: string;
  Mduid: string;
}

interface CategoryDfcDre {
  id: number;
  tipo: string[];
  label: string;
}

export interface CategoryMeta {
  dfc: CategoryDfcDre[];
  dre: CategoryDfcDre[];
}

interface CategoryPermissions {
  visivel: boolean;
  acoes: {
    editar: boolean;
    excluir: boolean;
  };
  lancamento?: {
    tipo?: {
      c: string;
      v: string[];
    };
    conta?: {
      tipoInvestimento?: {
        c: string;
        v: number[];
      };
    };
    contaDestino?: {
      tipo?: {
        c: string;
        v: string[];
      };
    };
    contaOrigem?: {
      tipo?: {
        c: string;
        v: string[];
      };
      tipoInvestimento?: {
        c: string;
        v: number[];
      };
    };
  };
}

export interface Category {
  id: number;
  nome: string;
  nomeRel: string;
  tipo: 'd' | 'r' | 't';
  status: boolean;
  permissoes: CategoryPermissions;
  _ordenacao: string;
  sistema: boolean;
  tipoL?: number;
}

export interface CategoriesResponse {
  meta: CategoryMeta;
  items: Category[];
}

export interface NormalizedCategory {
  id: number;
  name: string;
  type: 'expense' | 'income' | 'transfer';
  active: boolean;
  system: boolean;
}

interface AccountTypeMeta {
  id: number;
  nome: string;
  liquidez?: number;
  basico?: boolean;
  grupobp?: number;
  invest?: boolean;
  pj?: boolean;
  finalidades?: number[];
}

interface AccountGroupMeta {
  id: number;
  nome: string;
}

interface AccountFinalidadeMeta {
  id: number;
  nome: string;
}

export interface AccountMeta {
  tipos: AccountTypeMeta[];
  gruposbp: AccountGroupMeta[];
  finalidades: AccountFinalidadeMeta[];
}

interface AccountBank {
  id: string;
  nome: string;
  img: string;
  tipo: string[];
}

interface AccountPermissions {
  visivel: boolean;
  acoes: {
    editar: boolean;
    excluir: boolean;
  };
  lancamento?: Record<string, unknown>;
}

export interface Account {
  id: number;
  nome: string;
  tipo: string;
  tipoNovo: number;
  classificacaobp?: string;
  status: boolean;
  encerrada: boolean;
  banco?: AccountBank;
  limite?: number;
  exibirBP: boolean;
  apenasTransferencia: boolean;
  dataUltimoExtrato?: string;
  saldoUltimoExtrato?: number;
  liquidez?: number;
  saldoInicial: number;
  moeda: number;
  dataSaldoInicial?: string;
  considerarCarteiraInvestimentos: number;
  permissoes: AccountPermissions;
  criptoGcap?: number;
  connectionAccount?: number;
  connection?: number;
  tipoLimite?: number;
  fechamento?: number;
  contada?: number;
  proximoVencimento?: string;
  proximoFechamento?: string;
  finalidade?: number;
  metasEconomia?: number[];
}

export interface AccountsResponse {
  meta: AccountMeta;
  items: Account[];
}

export interface NormalizedAccount {
  id: number;
  name: string;
  type: string;
  bank: string | null;
  balance: number;
  active: boolean;
  closed: boolean;
}

interface Tag {
  id: number;
  nome: string;
  status: boolean;
  cor: string;
}

export type TagsResponse = Tag[];

export interface NormalizedTag {
  id: number;
  name: string;
  color: string;
  active: boolean;
}

export interface MdcliConfig {
  auth?: AuthConfig;
  lastUpdated?: string;
}
