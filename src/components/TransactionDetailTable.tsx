import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  RotateCcw,
  Search,
} from 'lucide-react';
import { IncentiveRecord, TransactionStatusFilter } from '../types/incentive';
import { formatIDR, formatIndonesianDate, formatNumber } from '../utils/formatters';
import { DEPT_DESCRIPTIONS, exportTransactionsCSV } from '../utils/parseIncentiveData';

type SortField = 'id' | 'nama' | 'type' | 'dept' | 'noTrx' | 'sku' | 'amount';

interface TransactionDetailTableProps {
  records: IncentiveRecord[];
  selectedType: string | null;
  onSelectType: (type: string | null) => void;
  showEmployeeColumn?: boolean;
  title?: string;
  exportFilename?: string;
}

export const TransactionDetailTable: React.FC<TransactionDetailTableProps> = ({
  records,
  selectedType,
  onSelectType,
  showEmployeeColumn = false,
  title = 'Rincian Transaksi & SKU Insentif',
  exportFilename,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<TransactionStatusFilter>(
    TransactionStatusFilter.ALL
  );
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, deptFilter, statusFilter, selectedType, rowsPerPage]);

  const availableTypes = useMemo(() => {
    const set = new Set<string>();
    for (const r of records) {
      if (r.type) set.add(r.type);
    }
    return Array.from(set).sort();
  }, [records]);

  const availableDepts = useMemo(() => {
    const set = new Set<string>();
    for (const r of records) {
      if (r.dept) set.add(r.dept);
    }
    return Array.from(set).sort();
  }, [records]);

  const filteredAndSorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = records.filter((r) => {
      if (selectedType && r.type !== selectedType) return false;
      if (deptFilter !== 'ALL' && r.dept !== deptFilter) return false;
      if (statusFilter === TransactionStatusFilter.OCTOBER && !r.isPaidOctober) {
        return false;
      }
      if (statusFilter === TransactionStatusFilter.NOVEMBER && r.isPaidOctober) {
        return false;
      }
      if (statusFilter === TransactionStatusFilter.NEGATIVE && r.amount >= 0) {
        return false;
      }

      if (q) {
        const hay = showEmployeeColumn
          ? `${r.nip} ${r.nama} ${r.noTrx} ${r.sku} ${r.type} ${r.dept} ${r.statusBayar}`.toLowerCase()
          : `${r.noTrx} ${r.sku} ${r.type} ${r.dept} ${r.statusBayar}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'id':
          cmp = a.id - b.id;
          break;
        case 'nama':
          cmp = a.nama.localeCompare(b.nama);
          break;
        case 'type':
          cmp = a.type.localeCompare(b.type);
          break;
        case 'dept':
          cmp = a.dept.localeCompare(b.dept);
          break;
        case 'noTrx':
          cmp = (a.noTrx || '').localeCompare(b.noTrx || '');
          break;
        case 'sku':
          cmp = (a.sku || '').localeCompare(b.sku || '');
          break;
        case 'amount':
          cmp = a.amount - b.amount;
          break;
      }
      return sortAsc ? cmp : -cmp;
    });

    return sorted;
  }, [
    records,
    selectedType,
    deptFilter,
    statusFilter,
    searchQuery,
    sortField,
    sortAsc,
    showEmployeeColumn,
  ]);

  const summary = useMemo(() => {
    let total = 0;
    let oct = 0;
    let nov = 0;
    let minus = 0;
    for (const r of filteredAndSorted) {
      total += r.amount;
      if (r.isPaidOctober) oct += r.amount;
      else nov += r.amount;
      if (r.amount < 0) minus += r.amount;
    }
    return { total, oct, nov, minus };
  }, [filteredAndSorted]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * rowsPerPage;
  const paginatedRows = filteredAndSorted.slice(startIdx, startIdx + rowsPerPage);

  const hasActiveFilter =
    Boolean(selectedType) ||
    deptFilter !== 'ALL' ||
    statusFilter !== TransactionStatusFilter.ALL ||
    searchQuery.trim().length > 0;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc((prev) => !prev);
    } else {
      setSortField(field);
      setSortAsc(field === 'amount' ? false : true);
    }
  };

  const resetAllFilters = () => {
    onSelectType(null);
    setDeptFilter('ALL');
    setStatusFilter(TransactionStatusFilter.ALL);
    setSearchQuery('');
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />;
    }
    return sortAsc ? (
      <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
    );
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header & Filter Controls */}
      <div className="p-5 sm:p-6 border-b border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {title}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan{' '}
              <strong className="font-mono tabular-nums text-slate-800">
                {formatNumber(filteredAndSorted.length)}
              </strong>{' '}
              dari {formatNumber(records.length)} baris transaksi · Subtotal terfilter:{' '}
              <strong
                className={`font-mono tabular-nums ${
                  summary.total < 0 ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {formatIDR(summary.total)}
              </strong>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {hasActiveFilter && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                exportTransactionsCSV(
                  filteredAndSorted,
                  exportFilename ||
                    'Detail_Transaksi_Insentif_Informa_Alam_Sutera_Sep2026.csv'
                )
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV ({formatNumber(filteredAndSorted.length)})</span>
            </button>
          </div>
        </div>

        {/* 4-Column Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                showEmployeeColumn
                  ? 'Cari NIP, Nama, No. Trx, atau SKU...'
                  : 'Cari No. Trx, SKU, tipe, dept...'
              }
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
            />
          </div>

          <select
            value={selectedType || 'ALL'}
            onChange={(e) =>
              onSelectType(e.target.value === 'ALL' ? null : e.target.value)
            }
            aria-label="Filter Tipe Insentif"
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white cursor-pointer"
          >
            <option value="ALL">Semua Tipe Insentif ({availableTypes.length})</option>
            {availableTypes.map((t) => (
              <option key={t} value={t}>
                Tipe: {t}
              </option>
            ))}
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            aria-label="Filter Departemen"
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white cursor-pointer"
          >
            <option value="ALL">Semua Departemen ({availableDepts.length})</option>
            {availableDepts.map((d) => (
              <option key={d} value={d}>
                Dept {d} — {DEPT_DESCRIPTIONS[d] || 'Lini Produk'}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as TransactionStatusFilter)
            }
            aria-label="Filter Status Bayar"
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white cursor-pointer"
          >
            <option value={TransactionStatusFilter.ALL}>
              Semua Jadwal Pencairan
            </option>
            <option value={TransactionStatusFilter.OCTOBER}>
              Cair Bulan Ini (Oktober 2026)
            </option>
            <option value={TransactionStatusFilter.NOVEMBER}>
              Pending Bulan Depan (November 2026)
            </option>
            <option value={TransactionStatusFilter.NEGATIVE}>
              Hanya Potongan Minus / Retur (&lt; Rp 0)
            </option>
          </select>
        </div>

        {/* Live Filtered Subtotal Strip */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600">
            <span>
              Cair Oktober:{' '}
              <strong className="font-mono tabular-nums text-emerald-700">
                {formatIDR(summary.oct)}
              </strong>
            </span>
            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>
            <span>
              Pending November:{' '}
              <strong className="font-mono tabular-nums text-amber-700">
                {formatIDR(summary.nov)}
              </strong>
            </span>
            {summary.minus < 0 && (
              <>
                <span aria-hidden="true" className="text-slate-300">
                  ·
                </span>
                <span>
                  Potongan Minus:{' '}
                  <strong className="font-mono tabular-nums text-rose-600">
                    {formatIDR(summary.minus)}
                  </strong>
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <label htmlFor="rows-per-page-select">Baris per halaman:</label>
            <select
              id="rows-per-page-select"
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="px-2 py-1 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 font-mono text-xs cursor-pointer"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600">
              <th className="py-3 px-4 w-14">
                <button
                  type="button"
                  onClick={() => handleSort('id')}
                  className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer whitespace-nowrap"
                >
                  <span>No</span>
                  {renderSortIcon('id')}
                </button>
              </th>
              {showEmployeeColumn && (
                <th className="py-3 px-3">
                  <button
                    type="button"
                    onClick={() => handleSort('nama')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer whitespace-nowrap"
                  >
                    <span>NIP & Nama Sales</span>
                    {renderSortIcon('nama')}
                  </button>
                </th>
              )}
              <th className="py-3 px-3">
                <button
                  type="button"
                  onClick={() => handleSort('type')}
                  className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer whitespace-nowrap"
                >
                  <span>Tipe Insentif</span>
                  {renderSortIcon('type')}
                </button>
              </th>
              <th className="py-3 px-3">
                <button
                  type="button"
                  onClick={() => handleSort('dept')}
                  className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer whitespace-nowrap"
                >
                  <span>Dept</span>
                  {renderSortIcon('dept')}
                </button>
              </th>
              <th className="py-3 px-3">
                <button
                  type="button"
                  onClick={() => handleSort('noTrx')}
                  className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer whitespace-nowrap"
                >
                  <span>No. Transaksi</span>
                  {renderSortIcon('noTrx')}
                </button>
              </th>
              <th className="py-3 px-3">
                <button
                  type="button"
                  onClick={() => handleSort('sku')}
                  className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer whitespace-nowrap"
                >
                  <span>SKU</span>
                  {renderSortIcon('sku')}
                </button>
              </th>
              <th className="py-3 px-3 whitespace-nowrap">Jadwal Pencairan</th>
              <th className="py-3 px-4 text-right">
                <button
                  type="button"
                  onClick={() => handleSort('amount')}
                  className="inline-flex items-center justify-end gap-1 hover:text-slate-900 cursor-pointer whitespace-nowrap ml-auto"
                >
                  <span>INS Final (Rp)</span>
                  {renderSortIcon('amount')}
                </button>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs">
            {paginatedRows.map((row, idx) => {
              const isMinus = row.amount < 0;
              return (
                <tr
                  key={row.id}
                  className={`transition-colors ${
                    isMinus
                      ? 'bg-rose-50/40 hover:bg-rose-50/80'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  <td className="py-2.5 px-4 font-mono tabular-nums text-slate-400">
                    {startIdx + idx + 1}
                  </td>

                  {showEmployeeColumn && (
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900 leading-snug">
                        {row.nama}
                      </div>
                      <div className="font-mono tabular-nums text-[11px] text-indigo-700">
                        NIP {row.nip}
                      </div>
                    </td>
                  )}

                  <td className="py-2.5 px-3 font-bold text-slate-800 whitespace-nowrap">
                    {row.type}
                  </td>

                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="font-mono font-semibold text-slate-800">
                      {row.dept}
                    </span>
                    {DEPT_DESCRIPTIONS[row.dept] && (
                      <span className="hidden xl:inline text-slate-400 ml-1.5">
                        · {DEPT_DESCRIPTIONS[row.dept]}
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {row.noTrx ? (
                      <div>
                        <div className="font-mono tabular-nums text-slate-800">
                          {row.noTrx}
                        </div>
                        {row.trxDate && (
                          <div className="text-[11px] text-slate-400">
                            {formatIndonesianDate(row.trxDate)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">
                        Rekap Non-Faktur
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 font-mono tabular-nums text-slate-700 whitespace-nowrap">
                    {row.sku || '-'}
                  </td>

                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`font-medium ${
                        row.isPaidOctober
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {row.isPaidOctober
                        ? 'Cair Oktober 2026'
                        : 'Pending November 2026'}
                    </span>
                  </td>

                  <td
                    className={`py-2.5 px-4 text-right font-mono tabular-nums font-bold whitespace-nowrap ${
                      isMinus
                        ? 'text-rose-600'
                        : row.amount === 0
                        ? 'text-slate-400'
                        : 'text-slate-900'
                    }`}
                  >
                    {formatIDR(row.amount)}
                  </td>
                </tr>
              );
            })}

            {paginatedRows.length === 0 && (
              <tr>
                <td
                  colSpan={showEmployeeColumn ? 8 : 7}
                  className="py-12 px-4 text-center text-slate-500 space-y-2"
                >
                  <p className="text-sm font-semibold text-slate-700">
                    Tidak ditemukan baris transaksi yang sesuai filter.
                  </p>
                  {hasActiveFilter && (
                    <button
                      type="button"
                      onClick={resetAllFilters}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Tampilkan Semua Transaksi</span>
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredAndSorted.length > 0 && (
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="font-mono tabular-nums">
            Baris {formatNumber(startIdx + 1)}–
            {formatNumber(Math.min(startIdx + rowsPerPage, filteredAndSorted.length))}{' '}
            dari {formatNumber(filteredAndSorted.length)}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            <span className="px-3 py-1.5 font-mono tabular-nums font-semibold text-slate-800">
              Hal {safePage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <span>Berikutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
