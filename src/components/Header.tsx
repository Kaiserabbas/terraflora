import React from 'react';
import {
  FileSpreadsheet,
  FileText,
  Printer,
  FileDown,
  Layers,
  ClipboardList,
  Activity,
  Trees,
  RefreshCw,
  Sparkles,
  Globe2,
  MapPin,
} from 'lucide-react';
import type { Currency } from '../types/landscape.ts';
import {
  CURRENCY_METADATA,
  CurrencyCode,
} from '../utils/currencyService.ts';

interface HeaderProps {
  activeTab: 'survey' | 'map' | 'hydraulics' | 'boq' | 'plants' | 'preview';
  setActiveTab: (tab: 'survey' | 'map' | 'hydraulics' | 'boq' | 'plants' | 'preview') => void;
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  exchangeRates: Record<CurrencyCode, number>;
  rateSource: string;
  isRatesLoading: boolean;
  onRefreshRates: () => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
  onPrint: () => void;
  onResetToSample: () => void;
  onLoadPreset: (preset: 'villa' | 'xeriscape' | 'commercial') => void;
  onOpenAIAdvisor: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currency,
  onCurrencyChange,
  exchangeRates,
  rateSource,
  isRatesLoading,
  onRefreshRates,
  onExportExcel,
  onExportPDF,
  onExportCSV,
  onPrint,
  onResetToSample,
  onLoadPreset,
  onOpenAIAdvisor,
}) => {
  const currencyKeys: CurrencyCode[] = [
    'PKR',
    'INR',
    'AED',
    'SAR',
    'QAR',
    'OMR',
    'KWD',
    'BHD',
    'EUR',
    'USD',
    'GBP',
    'CAD',
    'AUD',
    'SGD',
    'MYR',
    'EGP',
    'TRY',
  ];

  const currentRate = exchangeRates[currency as CurrencyCode] || 1.0;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs no-print">
      <div className="w-full px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Brand Wordmark Zone */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-xs ring-1 ring-emerald-500/20">
              <Trees className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                TerraFlora
              </span>
              <span className="hidden xl:inline-block ml-2 text-2xs font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                Landscape & BOQ Architect
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl text-xs sm:text-sm font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('survey')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'survey'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="w-4 h-4 text-emerald-600" />
              <span>Site Survey</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'map'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Visual Site Map</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('hydraulics')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'hydraulics'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Irrigation Hydraulics</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('boq')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'boq'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>BOQ Sheet</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('plants')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'plants'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4 text-amber-600" />
              <span>Plant & Material Library</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'preview'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Client Proposal</span>
            </button>
          </nav>

          {/* Action Zone: AI Advisor + Currency + Exports */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* AI Advisor Button */}
            <button
              type="button"
              onClick={onOpenAIAdvisor}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 active:from-emerald-800 active:to-teal-900 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">AI Architect</span>
              <span className="sm:hidden font-bold">AI</span>
            </button>

            {/* 17 Currencies Selector */}
            <div className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg px-2 py-1 transition-colors">
              <Globe2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value as Currency)}
                className="bg-transparent text-xs font-bold text-slate-900 focus:outline-hidden cursor-pointer"
                aria-label="Select Currency"
              >
                {currencyKeys.map((c) => {
                  const meta = CURRENCY_METADATA[c];
                  return (
                    <option key={c} value={c}>
                      {meta.flag} {c} - {meta.name} ({meta.symbol.trim()})
                    </option>
                  );
                })}
              </select>

              {/* Live exchange rate badge */}
              <button
                type="button"
                onClick={onRefreshRates}
                disabled={isRatesLoading}
                title={`Exchange Rate: 1 USD = ${currentRate} ${currency} (${rateSource}). Click to refresh live rates.`}
                className="ml-1 text-3xs font-mono text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${isRatesLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">1$ = {currentRate}</span>
              </button>
            </div>

            {/* Presets dropdown */}
            <div className="relative group hidden xl:block">
              <button
                type="button"
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Templates</span>
              </button>
              <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-lg shadow-lg py-1 hidden group-hover:block z-50">
                <button
                  type="button"
                  onClick={() => onLoadPreset('villa')}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                >
                  Luxury Villa Garden (380m²)
                </button>
                <button
                  type="button"
                  onClick={() => onLoadPreset('xeriscape')}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                >
                  Modern Xeriscape (Low-Water)
                </button>
                <button
                  type="button"
                  onClick={() => onLoadPreset('commercial')}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                >
                  Commercial Park / Turf (850m²)
                </button>
              </div>
            </div>

            {/* Export CSV button */}
            <button
              type="button"
              onClick={onExportCSV}
              title="Download BOQ as CSV"
              className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              aria-label="Export CSV"
            >
              <FileDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Export PDF Button */}
            <button
              type="button"
              onClick={onExportPDF}
              title="Save & Download Official Proposal PDF"
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors shrink-0 cursor-pointer"
              aria-label="Export to PDF document"
            >
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />
              <span className="hidden sm:inline">PDF</span>
              <span className="sm:hidden font-medium">PDF</span>
            </button>

            {/* Primary Action: Export Excel */}
            <button
              type="button"
              onClick={onExportExcel}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs hover:shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
              aria-label="Export to Excel workbook"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Export Excel (.xlsx)</span>
              <span className="sm:hidden font-medium">Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation tab strip */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-200 px-2 py-1.5 bg-slate-50 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('survey')}
          className={`px-2 py-1 rounded ${activeTab === 'survey' ? 'bg-white text-emerald-700 font-bold shadow-xs' : 'text-slate-600'}`}
        >
          Survey
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('map')}
          className={`px-2 py-1 rounded ${activeTab === 'map' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600'}`}
        >
          Zone Map
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('hydraulics')}
          className={`px-2 py-1 rounded ${activeTab === 'hydraulics' ? 'bg-white text-emerald-700 font-bold shadow-xs' : 'text-slate-600'}`}
        >
          Hydraulics
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('plants')}
          className={`px-2 py-1 rounded ${activeTab === 'plants' ? 'bg-white text-emerald-700 font-bold shadow-xs' : 'text-slate-600'}`}
        >
          Library
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`px-2 py-1 rounded ${activeTab === 'preview' ? 'bg-white text-emerald-700 font-bold shadow-xs' : 'text-slate-600'}`}
        >
          Proposal
        </button>
      </div>
    </header>
  );
};
