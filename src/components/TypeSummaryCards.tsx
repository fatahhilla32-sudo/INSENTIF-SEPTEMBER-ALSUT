import React from 'react';
import { Filter, Layers, X } from 'lucide-react';
import { EmployeeTypeSummary } from '../types/incentive';
import { formatIDR, formatNumber, formatPercent } from '../utils/formatters';

interface TypeSummaryCardsProps {
  typeSummaries: EmployeeTypeSummary[];
  totalInsentif: number;
  selectedType: string | null;
  onSelectType: (type: string | null) => void;
  title?: string;
}

export const TypeSummaryCards: React.FC<TypeSummaryCardsProps> = ({
  typeSummaries,
  totalInsentif,
  selectedType,
  onSelectType,
  title = 'Akumulasi per Tipe Insentif',
}) => {
  const positivePool = typeSummaries.reduce(
    (sum, t) => sum + Math.max(0, t.total),
    0
  );

  return (
    <section aria-label={title} className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            {title}
          </h3>
          <span className="text-xs text-slate-500">
            · {typeSummaries.length} tipe aktif
          </span>
        </div>

        {selectedType ? (
          <button
            type="button"
            onClick={() => onSelectType(null)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>Filter Tipe: {selectedType}</span>
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Klik kartu tipe untuk memfilter tabel rincian</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {typeSummaries.map((item) => {
          const isSelected = selectedType === item.type;
          const share =
            positivePool > 0
              ? (Math.max(0, item.total) / positivePool) * 100
              : totalInsentif > 0
              ? (Math.max(0, item.total) / totalInsentif) * 100
              : 0;
          const barWidth = Math.min(100, Math.max(share > 0 ? 4 : 0, share));

          return (
            <button
              key={item.type}
              type="button"
              onClick={() => onSelectType(isSelected ? null : item.type)}
              className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50/60 text-slate-900'
              }`}
            >
              <div className="space-y-2 w-full">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-xs font-extrabold tracking-wide truncate ${
                      isSelected ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    {item.type}
                  </span>
                  <span
                    className={`text-xs font-mono tabular-nums font-semibold shrink-0 ${
                      isSelected ? 'text-indigo-100' : 'text-slate-500'
                    }`}
                  >
                    {formatNumber(item.count)} tx
                  </span>
                </div>

                <div
                  className={`font-mono tabular-nums text-lg font-extrabold tracking-tight ${
                    isSelected
                      ? 'text-white'
                      : item.total < 0
                      ? 'text-rose-600'
                      : 'text-slate-900'
                  }`}
                >
                  {formatIDR(item.total)}
                </div>

                {/* Clean SVG Progress Bar without inline style attributes */}
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
                    className={isSelected ? 'fill-indigo-400/50' : 'fill-slate-100'}
                  />
                  <rect
                    x="0"
                    y="0"
                    width={barWidth}
                    height="4"
                    className={isSelected ? 'fill-white' : 'fill-indigo-600'}
                  />
                </svg>
              </div>

              <div
                className={`pt-2 border-t text-xs space-y-1 w-full ${
                  isSelected ? 'border-indigo-500/70' : 'border-slate-100'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className={isSelected ? 'text-indigo-100' : 'text-slate-500'}>
                    Kontribusi: {formatPercent(share)}
                  </span>
                  <span
                    className={`font-semibold ${
                      isSelected
                        ? 'text-white'
                        : item.payoutLabel.includes('Oktober')
                        ? 'text-emerald-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {item.payoutLabel.includes('Oktober') ? 'Cair Okt' : 'Pending Nov'}
                  </span>
                </div>

                {item.negativeTotal < 0 && (
                  <div
                    className={`flex items-center justify-between font-mono tabular-nums text-[11px] ${
                      isSelected ? 'text-rose-100' : 'text-rose-600'
                    }`}
                  >
                    <span>Potongan minus:</span>
                    <span>{formatIDR(item.negativeTotal)}</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
