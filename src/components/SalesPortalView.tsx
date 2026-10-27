import React, { useMemo, useState } from 'react';
import {
  Database,
  FileText,
  LogOut,
  Search,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { SalesSummary } from '../types/incentive';
import { formatIDR, formatNumber } from '../utils/formatters';
import { TypeSummaryCards } from './TypeSummaryCards';
import { TransactionDetailTable } from './TransactionDetailTable';

interface SalesPortalViewProps {
  employee: SalesSummary;
  allEmployees: SalesSummary[];
  onSwitchEmployee: (emp: SalesSummary) => void;
  onSwitchToAdmin: () => void;
  onOpenSlip: (emp: SalesSummary) => void;
  onOpenSyncModal: () => void;
  onLogout: () => void;
  dataSourceLabel: string;
  totalRecordsCount: number;
}

export const SalesPortalView: React.FC<SalesPortalViewProps> = ({
  employee,
  allEmployees,
  onSwitchEmployee,
  onSwitchToAdmin,
  onOpenSlip,
  onOpenSyncModal,
  onLogout,
  dataSourceLabel,
  totalRecordsCount,
}) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [switchQuery, setSwitchQuery] = useState('');

  const initials = useMemo(() => {
    const words = employee.nama
      .replace(/[^a-zA-Z\s]/g, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (words.length === 0) return 'SL';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }, [employee.nama]);

  const rankIndex = useMemo(() => {
    const idx = allEmployees.findIndex((e) => e.nip === employee.nip);
    return idx >= 0 ? idx + 1 : null;
  }, [allEmployees, employee.nip]);

  const filteredSwitchList = useMemo(() => {
    const q = switchQuery.trim().toLowerCase();
    if (!q) return allEmployees;
    return allEmployees.filter(
      (e) =>
        e.nip.toLowerCase().includes(q) || e.nama.toLowerCase().includes(q)
    );
  }, [allEmployees, switchQuery]);

  return (
    <div
      id="app-shell-main"
      className="min-h-screen bg-slate-100 flex flex-col text-slate-900"
    >
      {/* Top 3-Zone Navigation Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <span className="text-sm sm:text-base font-extrabold tracking-tight text-white whitespace-nowrap shrink-0">
            Portal Insentif Sales
          </span>

          {/* Zone 2: Concise Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <a
              href="#profil-sales"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Ringkasan Sales
            </a>
            <a
              href="#akumulasi-tipe"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Akumulasi Tipe
            </a>
            <a
              href="#rincian-transaksi"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Rincian Transaksi
            </a>
            <button
              type="button"
              onClick={() => setIsSwitchModalOpen(true)}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Ganti Sales
            </button>
            <button
              type="button"
              onClick={onSwitchToAdmin}
              className="text-amber-300 hover:text-amber-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Portal Manajer
            </button>
          </nav>

          {/* Zone 3: Primary Action */}
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
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 flex-1">
        {/* Employee Hero Summary Card */}
        <section
          id="profil-sales"
          className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="flex items-start sm:items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white font-display font-extrabold text-lg flex items-center justify-center shrink-0">
                {initials}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                  <span className="font-mono tabular-nums font-bold text-indigo-700">
                    NIP {employee.nip}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Informa Alam Sutera</span>
                  <span aria-hidden="true">·</span>
                  <span>Periode September 2026</span>
                  {rankIndex && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-slate-700">
                        Peringkat #{rankIndex} dari {allEmployees.length} Sales
                      </span>
                    </>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                  {employee.nama}
                </h1>

                <p className="text-xs text-slate-500 mt-1">
                  Departemen Aktif:{' '}
                  <span className="font-mono font-semibold text-slate-700">
                    {employee.departments.join(', ') || '-'}
                  </span>{' '}
                  · {formatNumber(employee.transactionCount)} baris SKU ({formatNumber(employee.uniqueTrxCount)} struk transaksi)
                </p>
              </div>
            </div>

            {/* Action Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsSwitchModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>Ganti Sales</span>
              </button>

              <button
                type="button"
                onClick={onSwitchToAdmin}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                <span>Portal Manajer (mgr35)</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenSlip(employee)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Lihat / Cetak Slip Insentif</span>
              </button>
            </div>
          </div>

          {/* 4-Column Personal Accumulation KPI Strip */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-900 text-white">
              <span className="text-xs font-medium text-indigo-300 block">
                Total Akumulasi Insentif Bersih
              </span>
              <span className="font-mono tabular-nums text-xl sm:text-2xl font-extrabold text-white block mt-1">
                {formatIDR(employee.totalInsentif)}
              </span>
              <span className="text-[11px] text-slate-300 block mt-1">
                Total INS Final September 2026
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-emerald-800 block">
                Cair Bulan Ini (Oktober 2026)
              </span>
              <span className="font-mono tabular-nums text-xl font-extrabold text-emerald-700 block mt-1">
                {formatIDR(employee.paidOctober)}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                Insentif Booster & Commercial
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-amber-800 block">
                Pending Bulan Depan (November 2026)
              </span>
              <span className="font-mono tabular-nums text-xl font-extrabold text-amber-700 block mt-1">
                {formatIDR(employee.pendingNovember)}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                Insentif Reguler, Special & Khusus
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-600 block">
                Potongan Minus / Retur Faktur
              </span>
              <span
                className={`font-mono tabular-nums text-xl font-extrabold block mt-1 ${
                  employee.negativeTotal < 0 ? 'text-rose-600' : 'text-slate-700'
                }`}
              >
                {employee.negativeTotal < 0
                  ? formatIDR(employee.negativeTotal)
                  : 'Rp 0'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                Insentif kotor positif: {formatIDR(employee.grossPositive)}
              </span>
            </div>
          </div>
        </section>

        {/* Per-Type Accumulation Cards */}
        <div id="akumulasi-tipe">
          <TypeSummaryCards
            typeSummaries={employee.typeSummaries}
            totalInsentif={employee.totalInsentif}
            selectedType={selectedType}
            onSelectType={setSelectedType}
            title={`Akumulasi Insentif per Tipe — ${employee.nama}`}
          />
        </div>

        {/* Full Personal Transaction Detail Table */}
        <div id="rincian-transaksi">
          <TransactionDetailTable
            records={employee.records}
            selectedType={selectedType}
            onSelectType={setSelectedType}
            showEmployeeColumn={false}
            title={`Rincian Transaksi & SKU — ${employee.nama} (${formatNumber(employee.transactionCount)} Baris)`}
            exportFilename={`Rincian_Insentif_${employee.nip}_${employee.nama.replace(/\s+/g, '_')}_Sep2026.csv`}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" />
            <span>
              {dataSourceLabel} · {formatNumber(totalRecordsCount)} baris transaksi terindeks
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onSwitchToAdmin}
              className="font-semibold text-amber-700 hover:text-amber-800 cursor-pointer"
            >
              Portal Manajer (mgr35)
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={onOpenSyncModal}
              className="font-semibold text-indigo-600 hover:text-indigo-800 underline underline-offset-2 cursor-pointer"
            >
              Kelola / Sinkron Data
            </button>
          </div>
        </div>
      </footer>

      {/* Switch Sales Account Modal */}
      {isSwitchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/55 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-5 sm:p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Ganti Akun Sales ({allEmployees.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSwitchModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                aria-label="Tutup daftar sales"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={switchQuery}
                onChange={(e) => setSwitchQuery(e.target.value)}
                placeholder="Cari NIP atau nama rekan sales..."
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div className="overflow-y-auto divide-y divide-slate-100 flex-1 pr-1">
              {filteredSwitchList.map((emp) => {
                const active = emp.nip === employee.nip;
                return (
                  <button
                    key={emp.nip}
                    type="button"
                    onClick={() => {
                      onSwitchEmployee(emp);
                      setSelectedType(null);
                      setIsSwitchModalOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                      active
                        ? 'bg-indigo-50 text-indigo-950 font-semibold'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="min-w-0 pr-3">
                      <div className="font-mono tabular-nums text-xs font-bold text-indigo-700">
                        NIP {emp.nip}
                      </div>
                      <div className="text-sm font-semibold truncate">
                        {emp.nama}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono tabular-nums font-bold text-emerald-700 text-xs sm:text-sm">
                        {formatIDR(emp.totalInsentif)}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                        {formatNumber(emp.transactionCount)} transaksi
                      </div>
                    </div>
                  </button>
                );
              })}

              {filteredSwitchList.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  Tidak ditemukan sales dengan kata kunci "{switchQuery}".
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
