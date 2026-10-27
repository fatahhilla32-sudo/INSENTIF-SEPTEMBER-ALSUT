/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { PortalDataState, SalesSummary } from './types/incentive';
import {
  DEFAULT_CSV_PATH,
  DEFAULT_SOURCE_LABEL,
  buildOverallPortalSummary,
  buildSalesSummaries,
  clearSavedCustomCSV,
  loadSavedCustomCSV,
  parseRawIncentiveCSV,
  saveCustomCSV,
} from './utils/parseIncentiveData';
import { LoginPortal } from './components/LoginPortal';
import { ManagerDashboard } from './components/ManagerDashboard';
import { SalesPortalView } from './components/SalesPortalView';
import { SlipInsentifModal } from './components/SlipInsentifModal';
import { DataSyncModal } from './components/DataSyncModal';

const SESSION_ADMIN_KEY = 'portal_is_admin';
const SESSION_SALES_NIP_KEY = 'portal_sales_nip';

export default function App() {
  const [defaultCsvText, setDefaultCsvText] = useState<string>('');
  const [dataState, setDataState] = useState<PortalDataState>({
    records: [],
    sourceLabel: DEFAULT_SOURCE_LABEL,
    isCustom: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(SESSION_ADMIN_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [activeSalesNip, setActiveSalesNip] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(SESSION_SALES_NIP_KEY);
    } catch {
      return null;
    }
  });

  const [slipEmployee, setSlipEmployee] = useState<SalesSummary | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await fetch(DEFAULT_CSV_PATH);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const rawDefault = await response.text();
      setDefaultCsvText(rawDefault);

      const savedCustom = loadSavedCustomCSV();
      if (savedCustom) {
        const customRecords = parseRawIncentiveCSV(savedCustom.csvText);
        if (customRecords.length > 0) {
          setDataState({
            records: customRecords,
            sourceLabel: savedCustom.label,
            isCustom: true,
          });
          setIsLoading(false);
          return;
        }
      }

      const defaultRecords = parseRawIncentiveCSV(rawDefault);
      setDataState({
        records: defaultRecords,
        sourceLabel: DEFAULT_SOURCE_LABEL,
        isCustom: false,
      });
    } catch {
      setLoadError(
        'Gagal memuat file data insentif September 2026. Silakan muat ulang halaman.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const employees = useMemo(
    () => buildSalesSummaries(dataState.records),
    [dataState.records]
  );

  const overallSummary = useMemo(
    () => buildOverallPortalSummary(dataState.records, employees),
    [dataState.records, employees]
  );

  const activeEmployee = useMemo(() => {
    if (!activeSalesNip) return null;
    return employees.find((e) => e.nip === activeSalesNip) || null;
  }, [employees, activeSalesNip]);

  const handleLoginSales = useCallback((emp: SalesSummary) => {
    setIsAdmin(false);
    setActiveSalesNip(emp.nip);
    try {
      sessionStorage.removeItem(SESSION_ADMIN_KEY);
      sessionStorage.setItem(SESSION_SALES_NIP_KEY, emp.nip);
    } catch {
      // Ignore sessionStorage errors
    }
  }, []);

  const handleLoginAdmin = useCallback(() => {
    setIsAdmin(true);
    setActiveSalesNip(null);
    try {
      sessionStorage.setItem(SESSION_ADMIN_KEY, 'true');
      sessionStorage.removeItem(SESSION_SALES_NIP_KEY);
    } catch {
      // Ignore sessionStorage errors
    }
  }, []);

  const handleLogout = useCallback(() => {
    setIsAdmin(false);
    setActiveSalesNip(null);
    setSlipEmployee(null);
    try {
      sessionStorage.removeItem(SESSION_ADMIN_KEY);
      sessionStorage.removeItem(SESSION_SALES_NIP_KEY);
    } catch {
      // Ignore sessionStorage errors
    }
  }, []);

  const handleApplyCustomCSV = useCallback((csvText: string, label: string) => {
    const parsed = parseRawIncentiveCSV(csvText);
    if (parsed.length === 0) return;
    saveCustomCSV(csvText, label);
    setDataState({
      records: parsed,
      sourceLabel: label,
      isCustom: true,
    });
  }, []);

  const handleResetDefaultData = useCallback(() => {
    clearSavedCustomCSV();
    const parsed = parseRawIncentiveCSV(defaultCsvText);
    setDataState({
      records: parsed,
      sourceLabel: DEFAULT_SOURCE_LABEL,
      isCustom: false,
    });
  }, [defaultCsvText]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="h-5 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-72 bg-slate-100 rounded animate-pulse" />
          <div className="space-y-2.5 pt-2">
            <div className="h-11 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-11 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-10 bg-indigo-100 rounded-xl animate-pulse" />
          </div>
          <p className="text-xs text-slate-500 text-center">
            Memuat 6.558 baris data insentif Informa Alam Sutera...
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-md rounded-2xl border border-rose-200 p-6 text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Gagal Memuat Data Insentif
          </h2>
          <p className="text-xs text-slate-600">{loadError}</p>
          <button
            type="button"
            onClick={fetchInitialData}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Coba Muat Ulang</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {isAdmin ? (
        <ManagerDashboard
          overallSummary={overallSummary}
          employees={employees}
          records={dataState.records}
          dataSourceLabel={dataState.sourceLabel}
          onOpenEmployeePortal={handleLoginSales}
          onOpenSlip={(emp) => setSlipEmployee(emp)}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
          onLogout={handleLogout}
        />
      ) : activeEmployee ? (
        <SalesPortalView
          employee={activeEmployee}
          allEmployees={employees}
          onSwitchEmployee={handleLoginSales}
          onSwitchToAdmin={handleLoginAdmin}
          onOpenSlip={(emp) => setSlipEmployee(emp)}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
          onLogout={handleLogout}
          dataSourceLabel={dataState.sourceLabel}
          totalRecordsCount={dataState.records.length}
        />
      ) : (
        <LoginPortal
          employees={employees}
          onLoginSales={handleLoginSales}
          onLoginAdmin={handleLoginAdmin}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
          dataSourceLabel={dataState.sourceLabel}
          totalRecordsCount={dataState.records.length}
          isCustomData={dataState.isCustom}
        />
      )}

      {slipEmployee && (
        <SlipInsentifModal
          employee={slipEmployee}
          onClose={() => setSlipEmployee(null)}
        />
      )}

      <DataSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onApplyCustomCSV={handleApplyCustomCSV}
        onResetDefault={handleResetDefaultData}
        isCustomData={dataState.isCustom}
        currentLabel={dataState.sourceLabel}
        totalActiveRecords={dataState.records.length}
        totalEmployees={employees.length}
      />
    </>
  );
}
