import {
  DepartmentSummary,
  EmployeeTypeSummary,
  IncentiveRecord,
  OverallPortalSummary,
  SalesSummary,
} from '../types/incentive';

export const DEFAULT_CSV_PATH = '/assets/aistudio/INSENTIF_SEPTEMBER_83f2fcb6';
export const DEFAULT_SOURCE_LABEL = 'Sheet INSENTIF SEPTEMBER (Informa Alam Sutera)';

const CUSTOM_CSV_STORAGE_KEY = 'informa_alsut_sept26_custom_csv';
const CUSTOM_LABEL_STORAGE_KEY = 'informa_alsut_sept26_custom_label';

export const DEPT_DESCRIPTIONS: Record<string, string> = {
  BA: 'Furnitur Utama & Set Ruang',
  CZ: 'Proyek & Penjualan Commercial',
  BD: 'Living & Seating Collection',
  BP: 'Mattress & Bedding System',
  BB: 'Bedroom & Wardrobe',
  BL: 'Home Accessories & Lighting',
  BJ: 'Aksesoris & Dekorasi Spesial',
  BG: 'Dining & Kitchen Furniture',
  BQ: 'Office & Workspace Series',
  BF: 'Relaxing & Recliner',
  BC: 'Modular & Cabinet',
  BR: 'Custom & Penyimpanan',
  BM: 'Home Textile & Linens',
  BI: 'Kitchenware & Diningware',
  BK: 'Storage & Organizer',
  BN: 'Household & Daily Utility',
  BO: 'Electronics & Small Appliance',
  BE: 'Kids & Study Furniture',
  BH: 'Outdoor & Patio',
  DB: 'Layanan & Proteksi Produk',
  DA: 'Layanan Pendukung',
  C: 'Penyesuaian / Koreksi Retur',
  AB: 'Penyesuaian / Koreksi Retur',
};

function parseDelimitedLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function extractDateFromTrx(noTrx: string): string | null {
  if (!noTrx) return null;
  const match = noTrx.match(/(20\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])/);
  if (!match) return null;
  return `${match[1]}-${match[2]}-${match[3]}`;
}

function parseNumericAmount(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[Rp\s"]/gi, '').trim();
  if (!cleaned || cleaned === '-') return 0;
  // Handle Indonesian dot-thousands if no comma decimals exist, or standard comma-thousands
  if (/^-?\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    return parseFloat(cleaned.replace(/\./g, '')) || 0;
  }
  return parseFloat(cleaned.replace(/,/g, '')) || 0;
}

export function deriveDefaultPassword(nip: string): string {
  const clean = nip.trim();
  if (clean.length >= 3) {
    return clean.slice(-3);
  }
  return clean.padStart(3, '0');
}

export function parseRawIncentiveCSV(rawText: string): IncentiveRecord[] {
  const lines = rawText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const headerLine = lines[0];
  const tabCount = (headerLine.match(/\t/g) || []).length;
  const semiCount = (headerLine.match(/;/g) || []).length;
  const commaCount = (headerLine.match(/,/g) || []).length;
  let delimiter = ',';
  if (tabCount > commaCount && tabCount >= semiCount) delimiter = '\t';
  else if (semiCount > commaCount) delimiter = ';';

  const headers = parseDelimitedLine(headerLine, delimiter).map((h) => h.toLowerCase());
  const idxNip = headers.findIndex((h) => h.includes('nip'));
  const idxNama = headers.findIndex((h) => h.includes('nama') || h.includes('name'));
  const idxType = headers.findIndex((h) => h.includes('type') || h.includes('tipe'));
  const idxStatus = headers.findIndex((h) => h.includes('status'));
  const idxDept = headers.findIndex((h) => h.includes('dept') || h.includes('departemen'));
  const idxTrx = headers.findIndex((h) => h.includes('trx') || h.includes('transaksi') || h.includes('receipt'));
  const idxSku = headers.findIndex((h) => h.includes('sku') || h.includes('kode') || h.includes('item'));
  const idxAmount = headers.findIndex((h) => h.includes('ins') || h.includes('final') || h.includes('nominal') || h.includes('total'));

  const nipCol = idxNip >= 0 ? idxNip : 0;
  const namaCol = idxNama >= 0 ? idxNama : 1;
  const typeCol = idxType >= 0 ? idxType : 2;
  const statusCol = idxStatus >= 0 ? idxStatus : 3;
  const deptCol = idxDept >= 0 ? idxDept : 4;
  const trxCol = idxTrx >= 0 ? idxTrx : 5;
  const skuCol = idxSku >= 0 ? idxSku : 6;
  const amountCol = idxAmount >= 0 ? idxAmount : 7;

  const nipToName: Record<string, string> = {};
  const parsedCols: string[][] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseDelimitedLine(lines[i], delimiter);
    if (cols.length < 3) continue;
    const nip = (cols[nipCol] || '').trim();
    if (!nip || nip.toLowerCase() === 'total' || nip.toLowerCase() === 'grand total') continue;
    parsedCols.push(cols);
    const nama = (cols[namaCol] || '').trim();
    if (nip && nama) {
      nipToName[nip] = nama;
    }
  }

  const records: IncentiveRecord[] = [];
  for (let i = 0; i < parsedCols.length; i++) {
    const cols = parsedCols[i];
    const nip = (cols[nipCol] || '').trim();
    const rawNama = (cols[namaCol] || '').trim();
    const resolvedNama = rawNama || nipToName[nip] || `(Tanpa Nama - NIP ${nip})`;
    const type = ((cols[typeCol] || 'LAINNYA').trim() || 'LAINNYA').toUpperCase();
    const statusBayar = (cols[statusCol] || '').trim() || 'Pending ke bulan depan (November 2026)';
    const dept = (cols[deptCol] || '-').trim() || '-';
    const noTrx = (cols[trxCol] || '').trim();
    const sku = (cols[skuCol] || '').trim();
    const amount = parseNumericAmount(cols[amountCol] || '0');
    const lowerStatus = statusBayar.toLowerCase();
    const isPaidOctober =
      lowerStatus.includes('dibayarkan') ||
      lowerStatus.includes('oktober') ||
      lowerStatus.includes('bulan ini');

    records.push({
      id: i + 1,
      nip,
      nama: resolvedNama,
      nameInferred: !rawNama && Boolean(nipToName[nip]),
      type,
      statusBayar,
      isPaidOctober,
      dept,
      noTrx,
      trxDate: extractDateFromTrx(noTrx),
      sku,
      amount,
    });
  }

  return records;
}

function buildTypeSummaries(records: IncentiveRecord[]): EmployeeTypeSummary[] {
  const map = new Map<
    string,
    {
      total: number;
      positiveTotal: number;
      negativeTotal: number;
      count: number;
      paidOctober: number;
      pendingNovember: number;
      octCount: number;
      novCount: number;
    }
  >();

  for (const r of records) {
    let entry = map.get(r.type);
    if (!entry) {
      entry = {
        total: 0,
        positiveTotal: 0,
        negativeTotal: 0,
        count: 0,
        paidOctober: 0,
        pendingNovember: 0,
        octCount: 0,
        novCount: 0,
      };
      map.set(r.type, entry);
    }
    entry.total += r.amount;
    if (r.amount > 0) entry.positiveTotal += r.amount;
    if (r.amount < 0) entry.negativeTotal += r.amount;
    entry.count += 1;
    if (r.isPaidOctober) {
      entry.paidOctober += r.amount;
      entry.octCount += 1;
    } else {
      entry.pendingNovember += r.amount;
      entry.novCount += 1;
    }
  }

  return Array.from(map.entries())
    .map(([type, d]) => {
      let payoutLabel = 'Pending November 2026';
      if (d.octCount > 0 && d.novCount === 0) {
        payoutLabel = 'Cair Oktober 2026';
      } else if (d.octCount > 0 && d.novCount > 0) {
        payoutLabel = 'Oktober & November';
      }
      return {
        type,
        total: d.total,
        positiveTotal: d.positiveTotal,
        negativeTotal: d.negativeTotal,
        count: d.count,
        paidOctober: d.paidOctober,
        pendingNovember: d.pendingNovember,
        payoutLabel,
      };
    })
    .sort((a, b) => b.total - a.total);
}

export function buildSalesSummaries(records: IncentiveRecord[]): SalesSummary[] {
  const map = new Map<
    string,
    {
      nip: string;
      nama: string;
      deptTotals: Record<string, number>;
      trxSet: Set<string>;
      paidOctober: number;
      pendingNovember: number;
      grossPositive: number;
      negativeTotal: number;
      totalInsentif: number;
      records: IncentiveRecord[];
    }
  >();

  for (const r of records) {
    let s = map.get(r.nip);
    if (!s) {
      s = {
        nip: r.nip,
        nama: r.nama,
        deptTotals: {},
        trxSet: new Set<string>(),
        paidOctober: 0,
        pendingNovember: 0,
        grossPositive: 0,
        negativeTotal: 0,
        totalInsentif: 0,
        records: [],
      };
      map.set(r.nip, s);
    }
    if (s.nama.startsWith('(Tanpa Nama') && !r.nama.startsWith('(Tanpa Nama')) {
      s.nama = r.nama;
    }
    s.totalInsentif += r.amount;
    if (r.amount > 0) s.grossPositive += r.amount;
    if (r.amount < 0) s.negativeTotal += r.amount;
    if (r.isPaidOctober) s.paidOctober += r.amount;
    else s.pendingNovember += r.amount;
    if (r.dept && r.dept !== '-') {
      s.deptTotals[r.dept] = (s.deptTotals[r.dept] || 0) + r.amount;
    }
    if (r.noTrx) s.trxSet.add(r.noTrx);
    s.records.push(r);
  }

  return Array.from(map.values())
    .map((s) => {
      const sortedDepts = Object.entries(s.deptTotals).sort((a, b) => b[1] - a[1]);
      const departments = sortedDepts.map(([d]) => d);
      const topDept = departments[0] || '-';
      return {
        nip: s.nip,
        nama: s.nama,
        nameUnknown: s.nama.startsWith('(Tanpa Nama'),
        defaultPassword: deriveDefaultPassword(s.nip),
        departments,
        topDept,
        transactionCount: s.records.length,
        uniqueTrxCount: s.trxSet.size,
        paidOctober: s.paidOctober,
        pendingNovember: s.pendingNovember,
        grossPositive: s.grossPositive,
        negativeTotal: s.negativeTotal,
        totalInsentif: s.totalInsentif,
        typeSummaries: buildTypeSummaries(s.records),
        records: s.records,
      };
    })
    .sort((a, b) => b.totalInsentif - a.totalInsentif);
}

export function buildOverallPortalSummary(
  records: IncentiveRecord[],
  employees: SalesSummary[]
): OverallPortalSummary {
  let totalInsentif = 0;
  let paidOctober = 0;
  let pendingNovember = 0;
  let grossPositive = 0;
  let totalNegative = 0;
  let negativeCount = 0;

  const uniqueTrx = new Set<string>();
  const uniqueSku = new Set<string>();
  const deptMap = new Map<
    string,
    {
      total: number;
      paidOctober: number;
      pendingNovember: number;
      negativeTotal: number;
      count: number;
      nips: Set<string>;
    }
  >();

  for (const r of records) {
    totalInsentif += r.amount;
    if (r.isPaidOctober) paidOctober += r.amount;
    else pendingNovember += r.amount;

    if (r.amount > 0) grossPositive += r.amount;
    if (r.amount < 0) {
      totalNegative += r.amount;
      negativeCount += 1;
    }

    if (r.noTrx) uniqueTrx.add(r.noTrx);
    if (r.sku) uniqueSku.add(r.sku);

    let dm = deptMap.get(r.dept);
    if (!dm) {
      dm = {
        total: 0,
        paidOctober: 0,
        pendingNovember: 0,
        negativeTotal: 0,
        count: 0,
        nips: new Set<string>(),
      };
      deptMap.set(r.dept, dm);
    }
    dm.total += r.amount;
    if (r.isPaidOctober) dm.paidOctober += r.amount;
    else dm.pendingNovember += r.amount;
    if (r.amount < 0) dm.negativeTotal += r.amount;
    dm.count += 1;
    dm.nips.add(r.nip);
  }

  const departmentSummaries: DepartmentSummary[] = Array.from(deptMap.entries())
    .map(([department, d]) => ({
      department,
      label: DEPT_DESCRIPTIONS[department] || `Departemen ${department}`,
      total: d.total,
      paidOctober: d.paidOctober,
      pendingNovember: d.pendingNovember,
      negativeTotal: d.negativeTotal,
      count: d.count,
      employeeCount: d.nips.size,
      sharePercent: totalInsentif > 0 ? Math.max(0, (d.total / totalInsentif) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  const octoberRecipientCount = employees.filter((e) => e.paidOctober > 0).length;
  const novemberRecipientCount = employees.filter((e) => e.pendingNovember > 0).length;

  return {
    totalInsentif,
    paidOctober,
    pendingNovember,
    grossPositive,
    totalNegative,
    negativeCount,
    totalRecords: records.length,
    uniqueTransactions: uniqueTrx.size,
    uniqueSkus: uniqueSku.size,
    totalEmployees: employees.length,
    octoberRecipientCount,
    novemberRecipientCount,
    typeSummaries: buildTypeSummaries(records),
    departmentSummaries,
  };
}

export function loadSavedCustomCSV(): { csvText: string; label: string } | null {
  try {
    const csvText = localStorage.getItem(CUSTOM_CSV_STORAGE_KEY);
    const label = localStorage.getItem(CUSTOM_LABEL_STORAGE_KEY);
    if (csvText && csvText.trim().length > 10) {
      return {
        csvText,
        label: label || 'Data Kustom Tersinkronisasi',
      };
    }
  } catch {
    // Ignore storage read errors in restricted contexts
  }
  return null;
}

export function saveCustomCSV(csvText: string, label: string): void {
  try {
    localStorage.setItem(CUSTOM_CSV_STORAGE_KEY, csvText);
    localStorage.setItem(CUSTOM_LABEL_STORAGE_KEY, label);
  } catch {
    // Ignore quota errors
  }
}

export function clearSavedCustomCSV(): void {
  try {
    localStorage.removeItem(CUSTOM_CSV_STORAGE_KEY);
    localStorage.removeItem(CUSTOM_LABEL_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function convertGoogleSheetUrlToCsv(inputUrl: string): string {
  const trimmed = inputUrl.trim();
  if (trimmed.includes('/export?format=csv') || trimmed.includes('output=csv')) {
    return trimmed;
  }
  const sheetIdMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!sheetIdMatch) return trimmed;
  const sheetId = sheetIdMatch[1];
  const gidMatch = trimmed.match(/[#&?]gid=(\d+)/);
  const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gidParam}`;
}

export function exportSalesRecapCSV(
  salesList: SalesSummary[],
  filename = 'Rekap_Akumulasi_Insentif_Sales_Informa_Alam_Sutera_Sep2026.csv'
): void {
  const headers = [
    'Peringkat',
    'NIP',
    'Nama Sales',
    'Departemen',
    'Jumlah Baris Transaksi',
    'Transaksi Unik (No. Trx)',
    'Cair Bulan Ini - Oktober 2026 (IDR)',
    'Pending Bulan Depan - November 2026 (IDR)',
    'Potongan Minus / Retur (IDR)',
    'Total Akumulasi Insentif Bersih (IDR)',
  ];

  const rows = salesList.map((s, idx) => [
    idx + 1,
    `"${s.nip}"`,
    `"${s.nama.replace(/"/g, '""')}"`,
    `"${s.departments.join(', ')}"`,
    s.transactionCount,
    s.uniqueTrxCount,
    Math.round(s.paidOctober),
    Math.round(s.pendingNovember),
    Math.round(s.negativeTotal),
    Math.round(s.totalInsentif),
  ]);

  const csvContent =
    '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportTransactionsCSV(
  records: IncentiveRecord[],
  filename = 'Detail_Transaksi_Insentif_Informa_Alam_Sutera_Sep2026.csv'
): void {
  const headers = [
    'No',
    'NIP',
    'Nama Sales',
    'Tipe Insentif',
    'Status Bayar',
    'Departemen',
    'No. Trx',
    'Tanggal Faktur',
    'SKU',
    'INS Final (IDR)',
  ];

  const rows = records.map((r, idx) => [
    idx + 1,
    `"${r.nip}"`,
    `"${r.nama.replace(/"/g, '""')}"`,
    `"${r.type}"`,
    `"${r.statusBayar.replace(/"/g, '""')}"`,
    `"${r.dept}"`,
    `"${r.noTrx}"`,
    `"${r.trxDate || '-'}"`,
    `"${r.sku}"`,
    Math.round(r.amount),
  ]);

  const csvContent =
    '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
