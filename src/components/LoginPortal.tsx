import React, { useState } from 'react';
import {
  ArrowRight,
  Building2,
  Database,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { SalesSummary } from '../types/incentive';
import { formatIDR, formatNumber } from '../utils/formatters';

interface LoginPortalProps {
  employees: SalesSummary[];
  onLoginSales: (employee: SalesSummary) => void;
  onLoginAdmin: () => void;
  onOpenSyncModal: () => void;
  dataSourceLabel: string;
  totalRecordsCount: number;
  isCustomData: boolean;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({
  employees,
  onLoginSales,
  onLoginAdmin,
  onOpenSyncModal,
  dataSourceLabel,
  totalRecordsCount,
  isCustomData,
}) => {
  const [activeTab, setActiveTab] = useState<'sales' | 'admin'>('sales');
  const [nipInput, setNipInput] = useState('');
  const [salesPassword, setSalesPassword] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sampleEmployees = employees.slice(0, 4);

  const handleSalesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanNip = nipInput.trim();
    const cleanPass = salesPassword.trim();

    if (cleanNip.toLowerCase() === 'mgr35') {
      if (cleanPass === '123456') {
        onLoginAdmin();
        return;
      }
      setErrorMessage('Password admin salah! Gunakan password manajer yang sesuai.');
      return;
    }

    if (!cleanNip) {
      setErrorMessage('Silakan masukkan NIP Sales Anda.');
      return;
    }
    if (!cleanPass) {
      setErrorMessage('Silakan masukkan password (3 digit terakhir NIP).');
      return;
    }

    const matched = employees.find((emp) => emp.nip === cleanNip);
    if (!matched) {
      setErrorMessage(
        `NIP "${cleanNip}" tidak ditemukan pada data periode September 2026 (${employees.length} sales terdaftar).`
      );
      return;
    }

    if (cleanPass !== matched.defaultPassword) {
      setErrorMessage(
        `Password tidak sesuai. Masukkan 3 digit terakhir dari NIP ${matched.nip}.`
      );
      return;
    }

    onLoginSales(matched);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const user = adminUsername.trim().toLowerCase();
    const pass = adminPassword.trim();

    if (!user) {
      setErrorMessage('Silakan masukkan username manajer / admin.');
      return;
    }
    if (user !== 'mgr35') {
      setErrorMessage('Username manajer tidak terdaftar.');
      return;
    }
    if (pass !== '123456') {
      setErrorMessage('Password manajer salah!');
      return;
    }

    onLoginAdmin();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Building2 className="w-7 h-7" />
          </div>
        </div>
        <h1 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Portal Insentif Sales
        </h1>
        <p className="mt-1.5 text-center text-sm text-slate-600">
          Informa Alam Sutera · Rekapitulasi Periode September 2026
        </p>
        <div className="mt-2 flex items-center justify-center gap-2 text-xs text-slate-500">
          <span>{formatNumber(employees.length)} Sales Aktif</span>
          <span aria-hidden="true">·</span>
          <span>{formatNumber(totalRecordsCount)} Baris Transaksi</span>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={onOpenSyncModal}
            className="text-indigo-600 hover:text-indigo-800 font-semibold underline underline-offset-2 cursor-pointer"
          >
            {isCustomData ? 'Data Kustom' : 'Kelola Data'}
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-5 sm:px-8 shadow-sm rounded-2xl border border-slate-200 space-y-5">
          {/* Segmented Login Role Selector */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setActiveTab('sales');
                setErrorMessage(null);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'sales'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Login Sales (NIP)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setErrorMessage(null);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Manajer / Admin</span>
            </button>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700"
            >
              {errorMessage}
            </div>
          )}

          {activeTab === 'sales' ? (
            <form onSubmit={handleSalesSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="nip-input"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Nomor Induk Pegawai (NIP Sales)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="nip-input"
                    type="text"
                    value={nipInput}
                    onChange={(e) => setNipInput(e.target.value)}
                    placeholder="Contoh: 175001"
                    autoComplete="username"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm font-mono tabular-nums transition-colors"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Masukkan NIP sesuai data insentif Informa Alam Sutera.
                </p>
              </div>

              <div>
                <label
                  htmlFor="password-input"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Password (3 Digit Terakhir NIP)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={salesPassword}
                    onChange={(e) => setSalesPassword(e.target.value)}
                    placeholder="Contoh: 001"
                    autoComplete="current-password"
                    maxLength={10}
                    className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm font-mono tabular-nums transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Tampilkan atau sembunyikan password"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Password standar adalah 3 angka paling belakang dari NIP Anda.
                </p>
              </div>

              <div className="pt-1">
                <button
                  id="btn-submit-login"
                  type="submit"
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors cursor-pointer"
                >
                  <span>Masuk ke Dashboard Sales</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  Akses manajer toko untuk meninjau{' '}
                  <strong>rekap akumulasi seluruh 96 sales</strong>, rincian 6.558 transaksi, dan cetak slip resmi.
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-user-input"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Username Manajer / Admin
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-600">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <input
                    id="admin-user-input"
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="mgr35"
                    autoComplete="username"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-sm font-mono transition-colors"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-pass-input"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Password Admin
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="admin-pass-input"
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="123456"
                    autoComplete="current-password"
                    className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-sm font-mono transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Tampilkan atau sembunyikan password"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Kredensial standar manajer: <span className="font-mono font-semibold text-slate-700">mgr35</span> / <span className="font-mono font-semibold text-slate-700">123456</span>
                </p>
              </div>

              <div className="pt-1">
                <button
                  id="btn-submit-admin-login"
                  type="submit"
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors cursor-pointer"
                >
                  <span>Masuk Dashboard Manajer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Quick Preview Access Section for Frictionless Inspection */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                Akses Cepat Pratinjau Dashboard
              </span>
              <button
                type="button"
                onClick={onLoginAdmin}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 cursor-pointer whitespace-nowrap"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Buka Portal Manajer (mgr35)</span>
              </button>
            </div>

            {sampleEmployees.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Contoh akun sales teratas (klik untuk langsung melihat):</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {sampleEmployees.map((emp) => (
                    <button
                      key={emp.nip}
                      type="button"
                      onClick={() => onLoginSales(emp)}
                      className="text-left p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-700 tabular-nums">
                          {emp.nip}
                        </span>
                        <span className="font-mono text-[11px] font-semibold text-emerald-700 tabular-nums">
                          {formatIDR(emp.totalInsentif)}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-800 truncate mt-0.5">
                        {emp.nama}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <Database className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{dataSourceLabel}</span>
        </div>
      </div>
    </div>
  );
};
