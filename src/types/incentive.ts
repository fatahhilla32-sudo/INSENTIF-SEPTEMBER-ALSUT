export enum PortalTabMode {
  SALES_ACCUMULATION = 'SALES_ACCUMULATION',
  ALL_TRANSACTIONS = 'ALL_TRANSACTIONS',
}

export enum SalesListFilter {
  ALL = 'ALL',
  HAS_OCTOBER = 'HAS_OCTOBER',
  ONLY_NOVEMBER = 'ONLY_NOVEMBER',
  HAS_NEGATIVE = 'HAS_NEGATIVE',
}

export enum SalesSortOption {
  TOTAL_DESC = 'TOTAL_DESC',
  TOTAL_ASC = 'TOTAL_ASC',
  OCTOBER_DESC = 'OCTOBER_DESC',
  NOVEMBER_DESC = 'NOVEMBER_DESC',
  TRX_DESC = 'TRX_DESC',
  NAME_ASC = 'NAME_ASC',
}

export enum TransactionStatusFilter {
  ALL = 'ALL',
  OCTOBER = 'OCTOBER',
  NOVEMBER = 'NOVEMBER',
  NEGATIVE = 'NEGATIVE',
}

export interface IncentiveRecord {
  id: number;
  nip: string;
  nama: string;
  nameInferred: boolean;
  type: string;
  statusBayar: string;
  isPaidOctober: boolean;
  dept: string;
  noTrx: string;
  trxDate: string | null;
  sku: string;
  amount: number;
}

export interface EmployeeTypeSummary {
  type: string;
  total: number;
  positiveTotal: number;
  negativeTotal: number;
  count: number;
  paidOctober: number;
  pendingNovember: number;
  payoutLabel: string;
}

export interface SalesSummary {
  nip: string;
  nama: string;
  nameUnknown: boolean;
  defaultPassword: string;
  departments: string[];
  topDept: string;
  transactionCount: number;
  uniqueTrxCount: number;
  paidOctober: number;
  pendingNovember: number;
  grossPositive: number;
  negativeTotal: number;
  totalInsentif: number;
  typeSummaries: EmployeeTypeSummary[];
  records: IncentiveRecord[];
}

export interface DepartmentSummary {
  department: string;
  label: string;
  total: number;
  paidOctober: number;
  pendingNovember: number;
  negativeTotal: number;
  count: number;
  employeeCount: number;
  sharePercent: number;
}

export interface OverallPortalSummary {
  totalInsentif: number;
  paidOctober: number;
  pendingNovember: number;
  grossPositive: number;
  totalNegative: number;
  negativeCount: number;
  totalRecords: number;
  uniqueTransactions: number;
  uniqueSkus: number;
  totalEmployees: number;
  octoberRecipientCount: number;
  novemberRecipientCount: number;
  typeSummaries: EmployeeTypeSummary[];
  departmentSummaries: DepartmentSummary[];
}

export interface PortalDataState {
  records: IncentiveRecord[];
  sourceLabel: string;
  isCustom: boolean;
}
