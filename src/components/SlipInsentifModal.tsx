import React from 'react';
import { CheckCircle2, FileText, Printer, X } from 'lucide-react';
import { SalesSummary } from '../types/incentive';
import { formatIDR, formatNumber } from '../utils/formatters';

interface SlipInsentifModalProps {
  employee: SalesSummary;
  onClose: () => void;
}

export const SlipInsentifModal: React.FC<SlipInsentifModalProps> = ({
  employee,
  onClose,
}) => {
  const negativeRows = employee.records.filter((r) => r.amount < 0);

  return (
    <div
      id="printable-slip-root"
      className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Top Modal Action Bar (hidden during print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Pratinjau Dokumen Slip Resmi Insentif Sales</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Tutup slip insentif"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-900">
          {/* Document Header */}
          <div className="pb-5 border-b-2 border-slate-900 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-widest text-indigo-700">
                INFORMA ALAM SUTERA · STORE 35
              </p>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 mt-0.5">
                SLIP RESMI RINCIAN INSENTIF SALES
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Sumber Data: Sheet INSENTIF SEPTEMBER · Periode Transaksi September 2026
              </p>
            </div>
            <div className="sm:text-right font-mono text-xs space-y-1 text-slate-600">
              <div className="font-bold text-slate-900">
                No: SLP/ALSUT/SEP26/{employee.nip}
              </div>
              <div>Periode: September 2026</div>
              <div className="inline-flex items-center gap-1 text-emerald-700 font-sans font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Terverifikasi Sistem</span>
              </div>
            </div>
          </div>

          {/* Employee Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Nama Sales</span>
              <strong className="text-slate-900 text-sm font-bold block mt-0.5">
                {employee.nama}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Nomor Induk (NIP)</span>
              <strong className="font-mono tabular-nums text-slate-900 text-sm font-bold block mt-0.5">
                {employee.nip}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Departemen Aktif</span>
              <strong className="font-mono text-slate-900 font-semibold block mt-0.5">
                {employee.departments.slice(0, 6).join(', ') || '-'}
                {employee.departments.length > 6
                  ? ` +${employee.departments.length - 6}`
                  : ''}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Volume Transaksi</span>
              <strong className="font-mono tabular-nums text-slate-900 font-bold block mt-0.5">
                {formatNumber(employee.transactionCount)} baris ({formatNumber(employee.uniqueTrxCount)} struk)
              </strong>
            </div>
          </div>

          {/* Section A: Per-Type Accumulation */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              A. Rincian Akumulasi per Tipe Insentif
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-2.5 px-3.5 text-left">Tipe Insentif</th>
                    <th className="py-2.5 px-3 text-left">Jadwal Pencairan</th>
                    <th className="py-2.5 px-3 text-right">Jml Baris</th>
                    <th className="py-2.5 px-3 text-right">Insentif Kotor</th>
                    <th className="py-2.5 px-3 text-right">Koreksi / Minus</th>
                    <th className="py-2.5 px-3.5 text-right">Subtotal Bersih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employee.typeSummaries.map((t) => (
                    <tr key={t.type}>
                      <td className="py-2.5 px-3.5 font-bold text-slate-900">
                        {t.type}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {t.payoutLabel}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                        {formatNumber(t.count)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                        {formatIDR(t.positiveTotal)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-rose-600">
                        {t.negativeTotal < 0 ? formatIDR(t.negativeTotal) : 'Rp 0'}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-mono tabular-nums font-bold text-slate-900">
                        {formatIDR(t.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section B: Negative Adjustments (if any) */}
          {negativeRows.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-700">
                B. Catatan Potongan Minus / Retur Faktur ({negativeRows.length} Baris)
              </h3>
              <div className="border border-rose-200 rounded-xl overflow-hidden bg-rose-50/30">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-rose-50 border-b border-rose-200 text-rose-800 font-bold">
                      <th className="py-2 px-3.5 text-left">No. Transaksi</th>
                      <th className="py-2 px-3 text-left">SKU</th>
                      <th className="py-2 px-3 text-left">Tipe / Dept</th>
                      <th className="py-2 px-3.5 text-right">Nominal Koreksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-100">
                    {negativeRows.slice(0, 10).map((r) => (
                      <tr key={r.id}>
                        <td className="py-2 px-3.5 font-mono tabular-nums text-slate-800">
                          {r.noTrx || 'Koreksi Non-Faktur'}
                        </td>
                        <td className="py-2 px-3 font-mono tabular-nums text-slate-700">
                          {r.sku || '-'}
                        </td>
                        <td className="py-2 px-3 text-slate-700">
                          {r.type} · Dept {r.dept}
                        </td>
                        <td className="py-2 px-3.5 text-right font-mono tabular-nums font-bold text-rose-600">
                          {formatIDR(r.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {negativeRows.length > 10 && (
                  <div className="px-3.5 py-2 text-[11px] text-rose-700 border-t border-rose-200">
                    Menampilkan 10 dari {negativeRows.length} baris koreksi minus. Total seluruh koreksi: {formatIDR(employee.negativeTotal)}.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section C: Payout Schedule & Grand Total Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60">
              <span className="text-xs font-semibold text-emerald-800 block">
                Cair Bulan Ini (Oktober 2026)
              </span>
              <span className="font-mono tabular-nums text-lg font-extrabold text-emerald-900 block mt-1">
                {formatIDR(employee.paidOctober)}
              </span>
              <span className="text-[11px] text-emerald-700 block mt-0.5">
                Tipe Booster & Commercial
              </span>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60">
              <span className="text-xs font-semibold text-amber-800 block">
                Pending Bulan Depan (November 2026)
              </span>
              <span className="font-mono tabular-nums text-lg font-extrabold text-amber-900 block mt-1">
                {formatIDR(employee.pendingNovember)}
              </span>
              <span className="text-[11px] text-amber-700 block mt-0.5">
                Tipe Reguler, Special & Khusus
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 text-white">
              <span className="text-xs font-semibold text-indigo-300 block">
                Total Akumulasi Bersih (INS Final)
              </span>
              <span className="font-mono tabular-nums text-xl font-extrabold text-white block mt-1">
                {formatIDR(employee.totalInsentif)}
              </span>
              <span className="text-[11px] text-slate-300 block mt-0.5">
                Akumulasi Oktober + November
              </span>
            </div>
          </div>

          {/* Signature Footer */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-600">
            <div>
              <p className="font-semibold text-slate-800">Mengetahui,</p>
              <p className="text-slate-500">Manajemen Toko Informa Alam Sutera</p>
              <div className="h-14" />
              <p className="font-bold text-slate-900 border-t border-slate-300 inline-block pt-1 pr-8">
                Store Manager / HR Admin
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-800">Penerima Insentif,</p>
              <p className="text-slate-500">Sales Executive · NIP {employee.nip}</p>
              <div className="h-14" />
              <p className="font-bold text-slate-900 border-t border-slate-300 inline-block pt-1 pl-8">
                {employee.nama}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Close Bar */}
        <div className="no-print bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between text-xs text-slate-500">
          <span>Gunakan tombol Cetak / Simpan PDF untuk mencetak ke kertas A4.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors cursor-pointer"
          >
            Tutup Slip
          </button>
        </div>
      </div>
    </div>
  );
};
