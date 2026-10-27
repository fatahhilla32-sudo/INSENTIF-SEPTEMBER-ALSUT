import React, { useMemo, useState } from 'react';
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  Database,
  Download,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
  Layers,
  LogOut,
  RotateCcw,
  Search,
  TrendingDown,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import {
  IncentiveRecord,
  OverallPortalSummary,
  PortalTabMode,
  SalesListFilter,
  SalesSortOption,
  SalesSummary,
} from '../types/incentive';
import { formatIDR, formatNumber, formatPercent } from '../utils/formatters';
import {
  DEPT_DESCRIPTIONS,
  exportSalesRecapCSV,
  exportTransactionsCSV,
} from '../utils/parseIncentiveData';
import { TypeSummaryCards } from './TypeSummaryCards';
import { TransactionDetailTable } from './TransactionDetailTable';

interface ManagerDashboardProps {
  overallSummary: OverallPortalSummary;
  employees: SalesSummary[];
  records: IncentiveRecord[];
  dataSourceLabel: string;
  onOpenEmployeePortal: (employee: SalesSummary) => void;
  onOpenSlip: (employee: SalesSummary) => void;
  onOpenSyncModal: () => void;
  onLogout: () => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  overallSummary,
  employees,
  records,
  dataSourceLabel,
  onOpenEmployeePortal,
  onOpenSlip,
  onOpenSyncModal,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<PortalTabMode>(
    PortalTabMode.SALES_ACCUMULATION
  );
  const [statusFilter, setStatusFilter] = useState<SalesListFilter>(
    SalesListFilter.ALL
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SalesSortOption>(
    SalesSortOption.TOTAL_DESC
  );

  // Employee Detail Inspection Modal State
  const [inspectedEmployee, setInspectedEmployee] =
    useState<SalesSummary | null>(null);
  const [inspectSelectedType, setInspectSelectedType] = useState<string | null>(
    null
  );

  const countsByFilter = useMemo(() => {
    let hasOct = 0;
    let onlyNov = 0;
    let hasNeg = 0;
    for (const emp of employees) {
      if (emp.paidOctober > 0) hasOct++;
      else onlyNov++;
      if (emp.negativeTotal < 0) hasNeg++;
    }
    return { hasOct, onlyNov, hasNeg };
  }, [employees]);

  const filteredSales = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = employees.filter((emp) => {
      if (statusFilter === SalesListFilter.HAS_OCTOBER && emp.paidOctober <= 0) {
        return false;
      }
      if (statusFilter === SalesListFilter.ONLY_NOVEMBER && emp.paidOctober > 0) {
        return false;
      }
      if (
        statusFilter === SalesListFilter.HAS_NEGATIVE &&
        emp.negativeTotal >= 0
      ) {
        return false;
      }

      if (deptFilter !== 'ALL' && !emp.departments.includes(deptFilter)) {
        return false;
      }

      if (
        typeFilter &&
        !emp.typeSummaries.some((t) => t.type === typeFilter)
      ) {
        return false;
      }

      if (q) {
        const hay = `${emp.nip} ${emp.nama} ${emp.departments.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });

    list.sort((a, b) => {
      switch (sortBy) {
        case SalesSortOption.TOTAL_DESC:
          return b.totalInsentif - a.totalInsentif;
        case SalesSortOption.TOTAL_ASC:
          return a.totalInsentif - b.totalInsentif;
        case SalesSortOption.OCTOBER_DESC:
          return b.paidOctober - a.paidOctober;
        case SalesSortOption.NOVEMBER_DESC:
          return b.pendingNovember - a.pendingNovember;
        case SalesSortOption.TRX_DESC:
          return b.transactionCount - a.transactionCount;
        case SalesSortOption.NAME_ASC:
          return a.nama.localeCompare(b.nama);
      }
    });

    return list;
  }, [employees, statusFilter, deptFilter, typeFilter, searchQuery, sortBy]);

  const filteredSalesTotals = useMemo(() => {
    let total = 0;
    let oct = 0;
    let nov = 0;
    let neg = 0;
    let trx = 0;
    for (const s of filteredSales) {
      total += s.totalInsentif;
      oct += s.paidOctober;
      nov += s.pendingNovember;
      neg += s.negativeTotal;
      trx += s.transactionCount;
    }
    return { total, oct, nov, neg, trx };
  }, [filteredSales]);

  const hasSalesFilter =
    statusFilter !== SalesListFilter.ALL ||
    deptFilter !== 'ALL' ||
    Boolean(typeFilter) ||
    searchQuery.trim().length > 0;

  const resetSalesFilters = () => {
    setStatusFilter(SalesListFilter.ALL);
    setDeptFilter('ALL');
    setTypeFilter(null);
    setSearchQuery('');
  };

  const octShare =
    overallSummary.totalInsentif > 0
      ? (overallSummary.paidOctober / overallSummary.totalInsentif) * 100
      : 0;
  const novShare =
    overallSummary.totalInsentif > 0
      ? (overallSummary.pendingNovember / overallSummary.totalInsentif) * 100
      : 0;

  return (
    <div
      id="app-shell-main"
      className="min-h-screen bg-slate-100 flex flex-col text-slate-900"
    >
      {/* Top 3-Zone Navigation Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-8">
          {/* Zone 1: Single Wordmark */}
          <span className="text-sm sm:text-base font-extrabold tracking-tight text-white whitespace-nowrap shrink-0">
            Portal Manajer Insentif
          </span>

          {/* Zone 2: Concise Single-Line Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <a
              href="#kpi-utama"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Ringkasan Utama
            </a>
            <a
              href="#distribusi-tipe-dept"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Tipe & Departemen
            </a>
            <a
              href="#eksplorasi-sales"
              onClick={() => setActiveTab(PortalTabMode.SALES_ACCUMULATION)}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Rekap Sales
            </a>
            <a
              href="#eksplorasi-sales"
              onClick={() => setActiveTab(PortalTabMode.ALL_TRANSACTIONS)}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Audit Transaksi
            </a>
            <button
              type="button"
              onClick={onOpenSyncModal}
              className="text-indigo-300 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Kelola Data
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 flex-1">
        {/* Executive Title & Export Toolbar */}
        <section
          id="kpi-utama"
          className="space-y-5"
        >
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                <span className="font-semibold text-amber-700">
                  Administrator Store · User ID: mgr35
                </span>
                <span aria-hidden="true">·</span>
                <span>Informa Alam Sutera (Store 35)</span>
                <span aria-hidden="true">·</span>
                <span>Periode September 2026</span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">
                Rekapitulasi Akumulasi & Detail Insentif Sales
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
                Ringkasan eksekutif perolehan insentif seluruh{' '}
                <strong className="text-slate-900">
                  {formatNumber(overallSummary.totalEmployees)} personel sales
                </strong>{' '}
                dari{' '}
                <strong className="text-slate-900">
                  {formatNumber(overallSummary.totalRecords)} baris transaksi
                </strong>{' '}
                ({formatNumber(overallSummary.uniqueTransactions)} nomor struk unik &{' '}
                {formatNumber(overallSummary.uniqueSkus)} SKU).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onOpenSyncModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                <Database className="w-3.5 h-3.5 text-indigo-600" />
                <span>Kelola Sumber Data</span>
              </button>

              <button
                type="button"
                onClick={() => exportSalesRecapCSV(filteredSales)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor Rekap Sales</span>
              </button>

              <button
                type="button"
                onClick={() => exportTransactionsCSV(records)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Ekspor Semua Transaksi</span>
              </button>
            </div>
          </div>

          {/* 4-Column Executive KPI Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Focal Anchor Card: Grand Total */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-indigo-300">
                  Total Akumulasi Insentif
                </span>
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 font-mono tabular-nums font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                {formatIDR(overallSummary.totalInsentif)}
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <span>{formatNumber(overallSummary.totalEmployees)} Sales Aktif</span>
                <span className="font-mono tabular-nums text-indigo-300 font-semibold">
                  {formatNumber(overallSummary.totalRecords)} Baris
                </span>
              </div>
            </div>

            {/* KPI 2: Paid in October */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-600">
                  Cair Bulan Ini (Oktober 2026)
                </span>
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 font-mono tabular-nums font-extrabold text-2xl sm:text-3xl text-emerald-700 tracking-tight">
                {formatIDR(overallSummary.paidOctober)}
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <span>Booster & Commercial</span>
                <span className="text-emerald-700 font-bold font-mono tabular-nums">
                  {formatPercent(octShare)} · {overallSummary.octoberRecipientCount} Sales
                </span>
              </div>
            </div>

            {/* KPI 3: Pending November */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-600">
                  Pending Bulan Depan (Nov 2026)
                </span>
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <CalendarClock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 font-mono tabular-nums font-extrabold text-2xl sm:text-3xl text-amber-700 tracking-tight">
                {formatIDR(overallSummary.pendingNovember)}
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <span>Reguler, Special & Khusus</span>
                <span className="text-amber-700 font-bold font-mono tabular-nums">
                  {formatPercent(novShare)} · {overallSummary.novemberRecipientCount} Sales
                </span>
              </div>
            </div>

            {/* KPI 4: Negative / Retur */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-600">
                  Potongan Minus Penjualan
                </span>
                <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                  <TrendingDown className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 font-mono tabular-nums font-extrabold text-2xl sm:text-3xl text-rose-600 tracking-tight">
                {formatIDR(overallSummary.totalNegative)}
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <span>{formatNumber(overallSummary.negativeCount)} baris koreksi retur</span>
                <span className="text-rose-600 font-semibold">
                  Mengurangi Total
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 2-Column Breakdown Grid: Per Incentive Type + Per Department */}
        <section
          id="distribusi-tipe-dept"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch"
        >
          {/* Left 2 Columns: Distribution per Incentive Type */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Distribusi Akumulasi per Tipe Insentif
                  </h2>
                </div>
                <span className="text-xs text-slate-500">
                  {overallSummary.typeSummaries.length} tipe terdata · Klik kartu untuk filter daftar sales
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {overallSummary.typeSummaries.map((t) => {
                  const share =
                    overallSummary.totalInsentif > 0
                      ? (Math.max(0, t.total) / overallSummary.totalInsentif) *
                        100
                      : 0;
                  const barWidth = Math.min(100, Math.max(4, share));
                  const isActive = typeFilter === t.type;

                  return (
                    <button
                      key={t.type}
                      type="button"
                      onClick={() =>
                        setTypeFilter(isActive ? null : t.type)
                      }
                      className={`text-left p-4 rounded-xl border transition-colors space-y-2 cursor-pointer ${
                        isActive
                          ? 'bg-indigo-50 border-indigo-400'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-xs text-slate-800 tracking-wide">
                          {t.type}
                        </span>
                        <span className="text-xs font-mono tabular-nums font-bold text-indigo-700">
                          {formatPercent(share)}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-mono tabular-nums font-extrabold text-base sm:text-lg text-slate-900">
                          {formatIDR(t.total)}
                        </span>
                        <span className="text-xs font-mono tabular-nums text-slate-500">
                          {formatNumber(t.count)} tx
                        </span>
                      </div>

                      <svg
                        viewBox="0 0 100 4"
                        preserveAspectRatio="none"
                        className="w-full h-1.5 rounded-full overflow-hidden block"
                        aria-hidden="true"
                      >
                        <rect
                          x="0"
                          y="0"
                          width="100"
                          height="4"
                          className="fill-slate-200"
                        />
                        <rect
                          x="0"
                          y="0"
                          width={barWidth}
                          height="4"
                          className={
                            t.payoutLabel.includes('Oktober')
                              ? 'fill-emerald-600'
                              : 'fill-indigo-600'
                          }
                        />
                      </svg>

                      <div className="pt-1 flex items-center justify-between text-[11px]">
                        <span
                          className={`font-semibold ${
                            t.payoutLabel.includes('Oktober')
                              ? 'text-emerald-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {t.payoutLabel}
                        </span>
                        {t.negativeTotal < 0 ? (
                          <span className="font-mono tabular-nums text-rose-600">
                            Minus: {formatIDR(t.negativeTotal)}
                          </span>
                        ) : (
                          <span className="text-slate-400">Tanpa potongan minus</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span>
                Insentif Kotor Positif:{' '}
                <strong className="font-mono tabular-nums text-slate-800">
                  {formatIDR(overallSummary.grossPositive)}
                </strong>
              </span>
              <span>
                Rata-rata per Sales:{' '}
                <strong className="font-mono tabular-nums text-indigo-700">
                  {formatIDR(
                    overallSummary.totalEmployees > 0
                      ? overallSummary.totalInsentif /
                          overallSummary.totalEmployees
                      : 0
                  )}
                </strong>
              </span>
            </div>
          </div>

          {/* Right 1 Column: Summary per Department */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 flex flex-col space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Ringkasan per Departemen
                  </h2>
                </div>
                {deptFilter !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setDeptFilter('ALL')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    Reset ({deptFilter})
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Distribusi insentif pada {overallSummary.departmentSummaries.length} kode departemen produk (klik untuk filter):
              </p>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {overallSummary.departmentSummaries.map((d) => {
                const barWidth = Math.min(
                  100,
                  Math.max(d.total > 0 ? 4 : 0, d.sharePercent)
                );
                const active = deptFilter === d.department;

                return (
                  <button
                    key={d.department}
                    type="button"
                    onClick={() =>
                      setDeptFilter(active ? 'ALL' : d.department)
                    }
                    className={`w-full text-left p-3 rounded-xl border transition-colors space-y-1.5 cursor-pointer ${
                      active
                        ? 'bg-indigo-50 border-indigo-400'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-xs text-indigo-800">
                        Dept {d.department} ·{' '}
                        <span className="font-sans font-medium text-slate-600">
                          {d.label}
                        </span>
                      </span>
                      <span className="text-[11px] font-mono tabular-nums font-semibold text-slate-500 shrink-0">
                        {d.employeeCount} sales · {formatPercent(d.sharePercent)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`font-mono tabular-nums font-bold text-sm ${
                          d.total < 0 ? 'text-rose-600' : 'text-slate-900'
                        }`}
                      >
                        {formatIDR(d.total)}
                      </span>
                      <span className="text-[11px] font-mono tabular-nums text-slate-500">
                        {formatNumber(d.count)} transaksi
                      </span>
                    </div>

                    <svg
                      viewBox="0 0 100 4"
                      preserveAspectRatio="none"
                      className="w-full h-1.5 rounded-full overflow-hidden block"
                      aria-hidden="true"
                    >
                      <rect
                        x="0"
                        y="0"
                        width="100"
                        height="4"
                        className="fill-slate-200"
                      />
                      <rect
                        x="0"
                        y="0"
                        width={barWidth}
                        height="4"
                        className="fill-indigo-600"
                      />
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Main Interactive Explorer Section: Sales Accumulation vs Full Transaction Audit */}
        <section id="eksplorasi-sales" className="space-y-4">
          {/* Segmented Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-1 p-1 bg-slate-200/80 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab(PortalTabMode.SALES_ACCUMULATION)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === PortalTabMode.SALES_ACCUMULATION
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4 text-indigo-600" />
                <span>
                  Daftar Akumulasi Seluruh Sales ({overallSummary.totalEmployees})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab(PortalTabMode.ALL_TRANSACTIONS)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === PortalTabMode.ALL_TRANSACTIONS
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                <span>
                  Rincian Seluruh Transaksi ({formatNumber(overallSummary.totalRecords)})
                </span>
              </button>
            </div>

            <span className="text-xs text-slate-500">
              Klik tombol <strong className="text-slate-700">Detail</strong> pada baris sales untuk membuka rincian SKU & Slip Insentif.
            </span>
          </div>

          {activeTab === PortalTabMode.SALES_ACCUMULATION ? (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {/* Filter & Search Header */}
              <div className="p-5 sm:p-6 border-b border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      Daftar Akumulasi Insentif Seluruh Sales ({filteredSales.length} Sales)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Menampilkan akumulasi pencairan Oktober 2026, pending November 2026, potongan minus, dan grand total per NIP.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {hasSalesFilter && (
                      <button
                        type="button"
                        onClick={resetSalesFilters}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Filter</span>
                      </button>
                    )}
                    <span className="text-xs font-mono tabular-nums text-slate-500">
                      Ditampilkan:{' '}
                      <strong className="text-slate-900">
                        {filteredSales.length}
                      </strong>{' '}
                      / {employees.length}
                    </span>
                  </div>
                </div>

                {/* Quick Filter Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStatusFilter(SalesListFilter.ALL)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      statusFilter === SalesListFilter.ALL
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Semua Sales ({employees.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusFilter(SalesListFilter.HAS_OCTOBER)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      statusFilter === SalesListFilter.HAS_OCTOBER
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    Ada Pencairan Oktober ({countsByFilter.hasOct})
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setStatusFilter(SalesListFilter.ONLY_NOVEMBER)
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      statusFilter === SalesListFilter.ONLY_NOVEMBER
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    Hanya Pending November ({countsByFilter.onlyNov})
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setStatusFilter(SalesListFilter.HAS_NEGATIVE)
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      statusFilter === SalesListFilter.HAS_NEGATIVE
                        ? 'bg-rose-600 text-white'
                        : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                    }`}
                  >
                    Ada Potongan Minus ({countsByFilter.hasNeg})
                  </button>
                </div>

                {/* 4-Column Search, Dept, Type & Sort Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari NIP atau Nama sales..."
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    />
                  </div>

                  <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    aria-label="Filter Departemen Sales"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white cursor-pointer"
                  >
                    <option value="ALL">
                      Semua Departemen ({overallSummary.departmentSummaries.length})
                    </option>
                    {overallSummary.departmentSummaries.map((d) => (
                      <option key={d.department} value={d.department}>
                        Dept {d.department} — {DEPT_DESCRIPTIONS[d.department] || d.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={typeFilter || 'ALL'}
                    onChange={(e) =>
                      setTypeFilter(
                        e.target.value === 'ALL' ? null : e.target.value
                      )
                    }
                    aria-label="Filter Tipe Insentif Sales"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white cursor-pointer"
                  >
                    <option value="ALL">Semua Tipe Insentif</option>
                    {overallSummary.typeSummaries.map((t) => (
                      <option key={t.type} value={t.type}>
                        Memiliki Tipe: {t.type}
                      </option>
                    ))}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value as SalesSortOption)
                    }
                    aria-label="Urutkan Daftar Sales"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white cursor-pointer"
                  >
                    <option value={SalesSortOption.TOTAL_DESC}>
                      Urutkan: Total Akumulasi Tertinggi
                    </option>
                    <option value={SalesSortOption.OCTOBER_DESC}>
                      Urutkan: Cair Oktober Tertinggi
                    </option>
                    <option value={SalesSortOption.NOVEMBER_DESC}>
                      Urutkan: Pending November Tertinggi
                    </option>
                    <option value={SalesSortOption.TRX_DESC}>
                      Urutkan: Jumlah Transaksi Terbanyak
                    </option>
                    <option value={SalesSortOption.TOTAL_ASC}>
                      Urutkan: Total Akumulasi Terendah
                    </option>
                    <option value={SalesSortOption.NAME_ASC}>
                      Urutkan: Nama Sales (A–Z)
                    </option>
                  </select>
                </div>
              </div>

              {/* Sales Accumulation Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                      <th className="py-3 px-4 w-12">#</th>
                      <th className="py-3 px-3 whitespace-nowrap">NIP</th>
                      <th className="py-3 px-3 whitespace-nowrap">Nama Sales</th>
                      <th className="py-3 px-3 whitespace-nowrap">Departemen</th>
                      <th className="py-3 px-3 text-right whitespace-nowrap">
                        Jml Trx
                      </th>
                      <th className="py-3 px-3 text-right whitespace-nowrap text-emerald-800">
                        Cair Oktober (Rp)
                      </th>
                      <th className="py-3 px-3 text-right whitespace-nowrap text-amber-800">
                        Pending November (Rp)
                      </th>
                      <th className="py-3 px-3 text-right whitespace-nowrap text-rose-700">
                        Potongan Minus
                      </th>
                      <th className="py-3 px-3 text-right whitespace-nowrap text-indigo-900">
                        Total Akumulasi (INS Final)
                      </th>
                      <th className="py-3 px-4 text-center whitespace-nowrap">
                        Aksi Rincian
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredSales.map((emp, index) => (
                      <tr
                        key={emp.nip}
                        className="hover:bg-slate-50/90 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono tabular-nums font-bold text-slate-400">
                          {index + 1}
                        </td>

                        <td className="py-3 px-3 font-mono tabular-nums font-bold text-indigo-700 whitespace-nowrap">
                          {emp.nip}
                        </td>

                        <td className="py-3 px-3 font-bold text-slate-900">
                          <button
                            type="button"
                            onClick={() => {
                              setInspectedEmployee(emp);
                              setInspectSelectedType(null);
                            }}
                            className="text-left hover:text-indigo-700 transition-colors cursor-pointer"
                          >
                            {emp.nama}
                          </button>
                        </td>

                        <td className="py-3 px-3 text-slate-600 font-mono">
                          <span className="truncate block max-w-[160px]" title={emp.departments.join(', ')}>
                            {emp.departments.slice(0, 4).join(', ') || '-'}
                            {emp.departments.length > 4
                              ? ` +${emp.departments.length - 4}`
                              : ''}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                          {formatNumber(emp.transactionCount)}
                        </td>

                        <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-emerald-700 whitespace-nowrap">
                          {emp.paidOctober !== 0
                            ? formatIDR(emp.paidOctober)
                            : '-'}
                        </td>

                        <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-amber-700 whitespace-nowrap">
                          {emp.pendingNovember !== 0
                            ? formatIDR(emp.pendingNovember)
                            : '-'}
                        </td>

                        <td className="py-3 px-3 text-right font-mono tabular-nums text-rose-600 whitespace-nowrap">
                          {emp.negativeTotal < 0
                            ? formatIDR(emp.negativeTotal)
                            : '-'}
                        </td>

                        <td
                          className={`py-3 px-3 text-right font-mono tabular-nums font-extrabold whitespace-nowrap ${
                            emp.totalInsentif < 0
                              ? 'text-rose-600'
                              : 'text-slate-900'
                          }`}
                        >
                          {formatIDR(emp.totalInsentif)}
                        </td>

                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setInspectedEmployee(emp);
                                setInspectSelectedType(null);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                              title="Lihat rincian akumulasi tipe & seluruh transaksi SKU"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Detail</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => onOpenSlip(emp)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                              title="Lihat & Cetak Slip Resmi Insentif"
                              aria-label={`Lihat slip insentif ${emp.nama}`}
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => onOpenEmployeePortal(emp)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 transition-colors cursor-pointer"
                              title="Buka tampilan Portal Individu Sales"
                              aria-label={`Buka portal ${emp.nama}`}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredSales.length === 0 && (
                      <tr>
                        <td
                          colSpan={10}
                          className="py-12 px-4 text-center text-slate-500"
                        >
                          Tidak ditemukan data sales yang sesuai dengan kriteria pencarian.
                        </td>
                      </tr>
                    )}
                  </tbody>

                  {filteredSales.length > 0 && (
                    <tfoot>
                      <tr className="bg-slate-900 text-white font-bold text-xs">
                        <td colSpan={4} className="py-3.5 px-4">
                          TOTAL AKUMULASI ({filteredSales.length} SALES TERFILTER)
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono tabular-nums">
                          {formatNumber(filteredSalesTotals.trx)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono tabular-nums text-emerald-300">
                          {formatIDR(filteredSalesTotals.oct)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono tabular-nums text-amber-300">
                          {formatIDR(filteredSalesTotals.nov)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono tabular-nums text-rose-300">
                          {formatIDR(filteredSalesTotals.neg)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono tabular-nums text-white text-sm">
                          {formatIDR(filteredSalesTotals.total)}
                        </td>
                        <td className="py-3.5 px-4" />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          ) : (
            <TransactionDetailTable
              records={records}
              selectedType={typeFilter}
              onSelectType={setTypeFilter}
              showEmployeeColumn={true}
              title={`Audit Rincian Seluruh Transaksi & SKU (${formatNumber(records.length)} Baris)`}
              exportFilename="Audit_Seluruh_Transaksi_Informa_Alam_Sutera_Sep2026.csv"
            />
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Dashboard Manajer · {dataSourceLabel}
          </div>
          <div className="flex items-center gap-3 font-mono tabular-nums text-slate-600">
            <span>Grand Total: {formatIDR(overallSummary.totalInsentif)}</span>
            <span aria-hidden="true">·</span>
            <span>{overallSummary.totalEmployees} Orang Sales</span>
          </div>
        </div>
      </footer>

      {/* Employee Detail Inspection Modal (matching admin-inspect-modal in reference) */}
      {inspectedEmployee && (
        <div
          id="admin-inspect-modal"
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          <div className="bg-slate-100 w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono tabular-nums font-bold text-indigo-700">
                    NIP {inspectedEmployee.nip}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Dept: {inspectedEmployee.departments.join(', ') || '-'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {formatNumber(inspectedEmployee.transactionCount)} baris transaksi
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                  Rincian Akumulasi & Transaksi: {inspectedEmployee.nama}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenEmployeePortal(inspectedEmployee)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Portal Sales</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenSlip(inspectedEmployee)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Lihat Slip Insentif</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInspectedEmployee(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Tutup rincian sales"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-white border border-slate-200">
                <div>
                  <span className="text-emerald-700 text-xs font-semibold block">
                    Cair Bulan Ini (Oktober 2026)
                  </span>
                  <span className="text-lg font-extrabold font-mono tabular-nums text-emerald-800 block mt-0.5">
                    {formatIDR(inspectedEmployee.paidOctober)}
                  </span>
                </div>

                <div>
                  <span className="text-amber-700 text-xs font-semibold block">
                    Pending Bulan Depan (November 2026)
                  </span>
                  <span className="text-lg font-extrabold font-mono tabular-nums text-amber-800 block mt-0.5">
                    {formatIDR(inspectedEmployee.pendingNovember)}
                  </span>
                </div>

                <div>
                  <span className="text-indigo-700 text-xs font-bold uppercase block">
                    Total Akumulasi Diterima (INS Final)
                  </span>
                  <span className="text-xl font-extrabold font-mono tabular-nums text-slate-900 block mt-0.5">
                    {formatIDR(inspectedEmployee.totalInsentif)}
                  </span>
                </div>
              </div>

              <TypeSummaryCards
                typeSummaries={inspectedEmployee.typeSummaries}
                totalInsentif={inspectedEmployee.totalInsentif}
                selectedType={inspectSelectedType}
                onSelectType={setInspectSelectedType}
              />

              <TransactionDetailTable
                records={inspectedEmployee.records}
                selectedType={inspectSelectedType}
                onSelectType={setInspectSelectedType}
                showEmployeeColumn={false}
                title={`Daftar Transaksi & SKU — ${inspectedEmployee.nama}`}
                exportFilename={`Rincian_Insentif_${inspectedEmployee.nip}_${inspectedEmployee.nama.replace(/\s+/g, '_')}.csv`}
              />
            </div>

            {/* Modal Footer */}
            <div className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
              <span>
                Total {formatNumber(inspectedEmployee.transactionCount)} baris transaksi untuk NIP {inspectedEmployee.nip}
              </span>
              <button
                type="button"
                onClick={() => setInspectedEmployee(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors cursor-pointer"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
