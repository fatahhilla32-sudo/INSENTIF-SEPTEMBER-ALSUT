import React, { useState } from 'react';
import {
  CheckCircle2,
  Database,
  Link2,
  RotateCcw,
  Upload,
  X,
} from 'lucide-react';
import { formatNumber } from '../utils/formatters';
import {
  convertGoogleSheetUrlToCsv,
  parseRawIncentiveCSV,
} from '../utils/parseIncentiveData';

interface DataSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCustomCSV: (csvText: string, label: string) => void;
  onResetDefault: () => void;
  isCustomData: boolean;
  currentLabel: string;
  totalActiveRecords: number;
  totalEmployees: number;
}

export const DataSyncModal: React.FC<DataSyncModalProps> = ({
  isOpen,
  onClose,
  onApplyCustomCSV,
  onResetDefault,
  isCustomData,
  currentLabel,
  totalActiveRecords,
  totalEmployees,
}) => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFeedback(null);

    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '');
      const parsed = parseRawIncentiveCSV(content);
      if (parsed.length === 0) {
        setFeedback({
          type: 'error',
          message:
            'File tidak memiliki format kolom insentif yang valid (pastikan terdapat kolom NIP, Nama, Type, Status Bayar, Dept, No. Trx, SKU, INS Final).',
        });
        return;
      }
      onApplyCustomCSV(content, `File Lokal: ${file.name}`);
      setFeedback({
        type: 'success',
        message: `Berhasil memuat ${formatNumber(parsed.length)} baris transaksi dari "${file.name}".`,
      });
    };
    reader.onerror = () => {
      setFeedback({
        type: 'error',
        message: 'Gagal membaca file. Silakan coba kembali.',
      });
    };
    reader.readAsText(file);
  };

  const handleUrlSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!sheetUrl.trim()) {
      setFeedback({
        type: 'error',
        message: 'Masukkan tautan CSV Google Sheets terlebih dahulu.',
      });
      return;
    }

    setIsSyncing(true);
    try {
      const csvEndpoint = convertGoogleSheetUrlToCsv(sheetUrl);
      const res = await fetch(csvEndpoint);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const csvText = await res.text();
      const parsed = parseRawIncentiveCSV(csvText);
      if (parsed.length === 0) {
        setFeedback({
          type: 'error',
          message:
            'Tautan berhasil diakses tetapi format kolom tidak sesuai atau spreadsheet belum dipublikasikan ke web (CSV).',
        });
        return;
      }
      onApplyCustomCSV(csvText, 'Sinkronisasi Google Sheets');
      setFeedback({
        type: 'success',
        message: `Berhasil menyinkronkan ${formatNumber(parsed.length)} baris data dari Google Sheets.`,
      });
    } catch {
      setFeedback({
        type: 'error',
        message:
          'Gagal mengambil data dari tautan tersebut. Pastikan Google Sheet telah diatur ke "Siapa saja yang memiliki link" atau "Publikasikan ke web sebagai CSV".',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleReset = () => {
    onResetDefault();
    setFeedback({
      type: 'success',
      message:
        'Data dikembalikan ke dataset bawaan Sheet INSENTIF SEPTEMBER Informa Alam Sutera.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Kelola & Sinkronisasi Sumber Data
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Tutup modal kelola data"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {/* Active Dataset Info */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-600">
                Sumber Data Aktif Saat Ini
              </span>
              <span
                className={`font-bold ${
                  isCustomData ? 'text-amber-700' : 'text-emerald-700'
                }`}
              >
                {isCustomData ? 'Data Kustom' : 'Default Resmi'}
              </span>
            </div>
            <p className="font-bold text-sm text-slate-900">{currentLabel}</p>
            <p className="text-slate-500 font-mono tabular-nums">
              {formatNumber(totalActiveRecords)} baris transaksi ·{' '}
              {formatNumber(totalEmployees)} personel sales terdaftar
            </p>
          </div>

          {feedback && (
            <div
              role="alert"
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}
            >
              {feedback.type === 'success' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Option 1: Upload CSV */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-800">
              1. Unggah File Spreadsheet (.csv / .tsv)
            </label>
            <p className="text-slate-500">
              Unggah pembaruan data insentif dengan kolom NIP, Nama, Type, Status Bayar, Dept, No. Trx, SKU, dan INS Final.
            </p>
            <label className="mt-1 flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/40 text-slate-700 font-bold transition-colors cursor-pointer">
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>Pilih File CSV dari Perangkat</span>
              <input
                type="file"
                accept=".csv,.tsv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Option 2: Google Sheets Sync */}
          <form onSubmit={handleUrlSync} className="space-y-2 pt-3 border-t border-slate-200">
            <label
              htmlFor="sheet-url-input"
              className="block font-bold text-slate-800"
            >
              2. Sinkronisasi Tautan Google Sheets
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="sheet-url-input"
                  type="url"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
              <button
                type="submit"
                disabled={isSyncing}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                {isSyncing ? 'Memuat...' : 'Sinkronkan'}
              </button>
            </div>
          </form>
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 text-xs">
          {isCustomData ? (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Kembalikan ke Data Default</span>
            </button>
          ) : (
            <span className="text-slate-500">
              Dataset default September 2026 aktif.
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
