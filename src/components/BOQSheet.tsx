import React, { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  Search,
  Sliders,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  Layers,
  ChevronDown,
  RefreshCw,
  Sparkles,
  Check,
} from 'lucide-react';
import type {
  BOQItem,
  BOQSectionId,
  BOQSummary,
  Currency,
} from '../types/landscape.ts';
import {
  calculateBOQTotals,
  formatCurrencyValue,
} from '../utils/calculations.ts';

interface BOQSheetProps {
  items: BOQItem[];
  currency: Currency;
  onUpdateItems: (newItems: BOQItem[]) => void;
  onResetToCalculated: () => void;
  onExportExcel: () => void;
  onExportPDF?: () => void;
  onOpenAIAdvisor?: () => void;
  onOpenPlantPalette?: () => void;
  onOpenAddCustom?: () => void;
  overheadProfitPercent: number;
  setOverheadProfitPercent: (pct: number) => void;
  contingencyPercent: number;
  setContingencyPercent: (pct: number) => void;
  taxPercent: number;
  setTaxPercent: (pct: number) => void;
}

export const BOQSheet: React.FC<BOQSheetProps> = ({
  items,
  currency,
  onUpdateItems,
  onResetToCalculated,
  onExportExcel,
  onExportPDF,
  onOpenAIAdvisor,
  onOpenPlantPalette,
  onOpenAddCustom,
  overheadProfitPercent,
  setOverheadProfitPercent,
  contingencyPercent,
  setContingencyPercent,
  taxPercent,
  setTaxPercent,
}) => {
  const [selectedSection, setSelectedSection] = useState<BOQSectionId | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Calculate live financial summary
  const summary: BOQSummary = useMemo(() => {
    return calculateBOQTotals(items, overheadProfitPercent, contingencyPercent, taxPercent);
  }, [items, overheadProfitPercent, contingencyPercent, taxPercent]);

  // Section configuration
  const sections: { id: BOQSectionId; name: string; tag: string }[] = [
    { id: 'A_PREP', name: 'Site Preliminaries & Preparation', tag: 'A' },
    { id: 'B_SOFTSCAPE', name: 'Softscaping & Plant Material', tag: 'B' },
    { id: 'C_IRRIGATION', name: 'Rain Bird Automatic Irrigation', tag: 'C' },
    { id: 'D_HARDSCAPE', name: 'Hardscaping & Garden Works', tag: 'D' },
    { id: 'E_LABOR', name: 'Labor, Testing & Commissioning', tag: 'E' },
    { id: 'F_MAINTENANCE', name: '90-Day Maintenance & Warranty', tag: 'F' },
  ];

  // Filtering items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSection = selectedSection === 'ALL' || item.section === selectedSection;
      const matchesSearch =
        searchQuery === '' ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.specification.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSection && matchesSearch;
    });
  }, [items, selectedSection, searchQuery]);

  // Handlers for modifying items
  const handleUpdateItem = (id: string, updates: Partial<BOQItem>) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        const next = { ...item, ...updates };
        next.amount = Number((next.quantity * next.unitRate).toFixed(2));
        return next;
      }
      return item;
    });
    onUpdateItems(updated);
  };

  const handleDeleteItem = (id: string) => {
    onUpdateItems(items.filter((item) => item.id !== id));
  };

  const handleDuplicateItem = (itemToCopy: BOQItem) => {
    const newItem: BOQItem = {
      ...itemToCopy,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      itemCode: `${itemToCopy.itemCode}-COPY`,
      description: `${itemToCopy.description} (Copy)`,
    };
    onUpdateItems([...items, newItem]);
  };

  const handleAddNewItem = (targetSection: BOQSectionId) => {
    const newItem: BOQItem = {
      id: `item-${Date.now()}`,
      section: targetSection,
      itemCode: `${targetSection[0]}-${String(items.filter((i) => i.section === targetSection).length + 1).padStart(2, '0')}`,
      category: 'Custom Item',
      description: 'New custom landscape item',
      specification: 'Client or site-specific specification',
      quantity: 1,
      unit: 'Nos',
      unitRate: 100,
      amount: 100,
    };
    onUpdateItems([...items, newItem]);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Financial KPI Overview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Interactive Spreadsheet
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500 font-mono">{items.length} Bill Items</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
              Bill of Quantities (BOQ) Schedule
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenAIAdvisor && (
              <button
                type="button"
                onClick={onOpenAIAdvisor}
                className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>AI Review & Advisor</span>
              </button>
            )}

            {onOpenAddCustom && (
              <button
                type="button"
                onClick={onOpenAddCustom}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Material</span>
              </button>
            )}

            {onOpenPlantPalette && (
              <button
                type="button"
                onClick={onOpenPlantPalette}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                <span>Browse Palette</span>
              </button>
            )}

            <button
              type="button"
              onClick={onResetToCalculated}
              title="Recalculate BOQ quantities directly from site survey dimensions"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-sync Survey</span>
            </button>

            {onExportPDF && (
              <button
                type="button"
                onClick={onExportPDF}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-rose-600" />
                <span>PDF Proposal</span>
              </button>
            )}

            <button
              type="button"
              onClick={onExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Financial KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider block">
              Direct Works Cost
            </span>
            <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {formatCurrencyValue(summary.directCostTotal, currency)}
            </span>
            <span className="text-2xs text-slate-400 block">Material & Subcontract</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">
                Overhead & Profit
              </span>
              <span className="text-2xs font-mono font-bold text-emerald-700">{overheadProfitPercent}%</span>
            </div>
            <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {formatCurrencyValue(summary.overheadProfitAmount, currency)}
            </span>
            <span className="text-2xs text-slate-400 block">Margin on direct cost</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">
                Contingency
              </span>
              <span className="text-2xs font-mono font-bold text-amber-700">{contingencyPercent}%</span>
            </div>
            <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {formatCurrencyValue(summary.contingencyAmount, currency)}
            </span>
            <span className="text-2xs text-slate-400 block">Site variation reserve</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">
                VAT / Sales Tax
              </span>
              <span className="text-2xs font-mono font-bold text-slate-700">{taxPercent}%</span>
            </div>
            <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {formatCurrencyValue(summary.taxAmount, currency)}
            </span>
            <span className="text-2xs text-slate-400 block">Statutory tax</span>
          </div>

          <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 col-span-2 sm:col-span-4 lg:col-span-1">
            <span className="text-2xs font-bold text-emerald-900 uppercase tracking-wider block">
              TOTAL PROJECT BOQ
            </span>
            <span className="text-xl font-extrabold font-mono text-emerald-800 tabular-nums">
              {formatCurrencyValue(summary.grandTotal, currency)}
            </span>
            <span className="text-2xs text-emerald-700 font-medium block">All taxes & margins included</span>
          </div>
        </div>

        {/* Section Percentage Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-2xs text-slate-500 font-medium mb-1.5">
            <span>Cost Distribution by Work Section:</span>
            <span>Direct Cost Total: {formatCurrencyValue(summary.directCostTotal, currency)}</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full flex overflow-hidden">
            {sections.map((sec, idx) => {
              const subtotal = summary.sectionSubtotals[sec.id] || 0;
              const pct = summary.directCostTotal > 0 ? (subtotal / summary.directCostTotal) * 100 : 0;
              const colors = [
                'bg-amber-500',
                'bg-emerald-500',
                'bg-blue-500',
                'bg-purple-500',
                'bg-teal-500',
                'bg-rose-500',
              ];
              return (
                <div
                  key={sec.id}
                  style={{ width: `${pct}%` }}
                  title={`${sec.name}: ${pct.toFixed(1)}%`}
                  className={`${colors[idx % colors.length]} transition-all`}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-2xs text-slate-600">
            {sections.map((sec, idx) => {
              const subtotal = summary.sectionSubtotals[sec.id] || 0;
              const colors = ['bg-amber-500', 'bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-teal-500', 'bg-rose-500'];
              return (
                <div key={sec.id} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${colors[idx % colors.length]}`} />
                  <span className="font-medium">{sec.tag}. {sec.name.split(' ')[0]}:</span>
                  <span className="font-mono text-slate-800">{formatCurrencyValue(subtotal, currency)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Section Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-xl text-xs font-medium">
          <button
            type="button"
            onClick={() => setSelectedSection('ALL')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              selectedSection === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Sections ({items.length})
          </button>
          {sections.map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => setSelectedSection(sec.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                selectedSection === sec.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sec {sec.tag} ({items.filter((i) => i.section === sec.id).length})
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative shrink-0 w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items, specs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Main BOQ Excel Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 font-semibold border-b border-slate-200 select-none">
                <th className="py-3 px-3 w-16">Code</th>
                <th className="py-3 px-3 w-32">Category</th>
                <th className="py-3 px-3 min-w-[200px]">Description & Material</th>
                <th className="py-3 px-3 min-w-[260px]">Technical Specification</th>
                <th className="py-3 px-3 w-24 text-right">Quantity</th>
                <th className="py-3 px-3 w-16 text-center">Unit</th>
                <th className="py-3 px-3 w-28 text-right">Unit Rate ({currency})</th>
                <th className="py-3 px-3 w-32 text-right">Amount ({currency})</th>
                <th className="py-3 px-3 w-20 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sections.map((sec) => {
                const sectionItems = filteredItems.filter((i) => i.section === sec.id);
                if (sectionItems.length === 0 && selectedSection !== 'ALL') return null;

                const sectionSubtotal = summary.sectionSubtotals[sec.id] || 0;

                return (
                  <React.Fragment key={sec.id}>
                    {/* Section Header Row */}
                    <tr className="bg-slate-50/80 font-bold text-slate-800 border-t-2 border-b border-slate-200">
                      <td colSpan={6} className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-mono font-bold">
                            {sec.tag}
                          </span>
                          <span className="text-xs uppercase tracking-wide">{sec.name}</span>
                          <span className="text-2xs text-slate-500 font-normal">
                            ({sectionItems.length} items)
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right text-xs text-slate-500 font-semibold">
                        Subtotal:
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatCurrencyValue(sectionSubtotal, currency)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleAddNewItem(sec.id)}
                          title={`Add item to ${sec.name}`}
                          className="p-1 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100/70 rounded transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>

                    {/* Section Item Rows */}
                    {sectionItems.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-emerald-50/30 transition-colors group"
                      >
                        {/* Item Code */}
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">
                          <input
                            type="text"
                            value={item.itemCode}
                            onChange={(e) => handleUpdateItem(item.id, { itemCode: e.target.value })}
                            className="w-full bg-transparent border-0 hover:bg-white focus:bg-white focus:ring-1 focus:ring-emerald-500 rounded px-1 py-0.5 font-mono text-xs"
                          />
                        </td>

                        {/* Category */}
                        <td className="py-2.5 px-3 text-slate-600">
                          <input
                            type="text"
                            value={item.category}
                            onChange={(e) => handleUpdateItem(item.id, { category: e.target.value })}
                            className="w-full bg-transparent border-0 hover:bg-white focus:bg-white focus:ring-1 focus:ring-emerald-500 rounded px-1 py-0.5 text-xs text-slate-700 font-medium"
                          />
                        </td>

                        {/* Description */}
                        <td className="py-2.5 px-3 text-slate-900">
                          <textarea
                            rows={2}
                            value={item.description}
                            onChange={(e) => handleUpdateItem(item.id, { description: e.target.value })}
                            className="w-full bg-transparent border-0 hover:bg-white focus:bg-white focus:ring-1 focus:ring-emerald-500 rounded px-1.5 py-1 text-xs resize-y"
                          />
                        </td>

                        {/* Specification */}
                        <td className="py-2.5 px-3 text-slate-600">
                          <textarea
                            rows={2}
                            value={item.specification}
                            onChange={(e) => handleUpdateItem(item.id, { specification: e.target.value })}
                            className="w-full bg-transparent border-0 hover:bg-white focus:bg-white focus:ring-1 focus:ring-emerald-500 rounded px-1.5 py-1 text-xs text-slate-500 resize-y"
                          />
                        </td>

                        {/* Quantity */}
                        <td className="py-2.5 px-3 text-right">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(item.id, { quantity: Number(e.target.value) })}
                            className="w-20 text-right bg-transparent border border-slate-200 hover:border-slate-300 focus:bg-white focus:ring-1 focus:ring-emerald-500 rounded px-1.5 py-1 font-mono font-semibold text-slate-900 tabular-nums text-xs"
                          />
                        </td>

                        {/* Unit */}
                        <td className="py-2.5 px-3 text-center">
                          <select
                            value={item.unit}
                            onChange={(e) => handleUpdateItem(item.id, { unit: e.target.value as any })}
                            className="bg-transparent border-0 text-slate-600 text-xs font-medium cursor-pointer"
                          >
                            <option value="m2">m²</option>
                            <option value="m3">m³</option>
                            <option value="Lm">Lm</option>
                            <option value="Nos">Nos</option>
                            <option value="Set">Set</option>
                            <option value="Bag">Bag</option>
                            <option value="Lot">Lot</option>
                            <option value="Month">Month</option>
                            <option value="Trip">Trip</option>
                          </select>
                        </td>

                        {/* Unit Rate */}
                        <td className="py-2.5 px-3 text-right">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.unitRate}
                            onChange={(e) => handleUpdateItem(item.id, { unitRate: Number(e.target.value) })}
                            className="w-24 text-right bg-transparent border border-slate-200 hover:border-slate-300 focus:bg-white focus:ring-1 focus:ring-emerald-500 rounded px-1.5 py-1 font-mono font-semibold text-slate-900 tabular-nums text-xs"
                          />
                        </td>

                        {/* Amount */}
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                          {formatCurrencyValue(item.quantity * item.unitRate, currency)}
                        </td>

                        {/* Actions: Copy & Delete */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleDuplicateItem(item)}
                              title="Duplicate Item"
                              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id)}
                              title="Delete Item"
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No items match the current search or section filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pricing Adjustments & Markup Sliders */}
        <div className="p-5 bg-slate-50/80 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Sliders className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Commercial Markup & Pricing Parameters
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Contractor Overhead & Profit</span>
                <span className="font-mono text-emerald-800">{overheadProfitPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="35"
                step="1"
                value={overheadProfitPercent}
                onChange={(e) => setOverheadProfitPercent(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <span className="text-2xs text-slate-500 mt-1 block">
                Calculated markup: {formatCurrencyValue(summary.overheadProfitAmount, currency)}
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Contingency Reserve</span>
                <span className="font-mono text-amber-800">{contingencyPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={contingencyPercent}
                onChange={(e) => setContingencyPercent(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <span className="text-2xs text-slate-500 mt-1 block">
                Reserved: {formatCurrencyValue(summary.contingencyAmount, currency)}
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>VAT / Applicable Sales Tax</span>
                <span className="font-mono text-slate-800">{taxPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={taxPercent}
                onChange={(e) => setTaxPercent(Number(e.target.value))}
                className="w-full accent-slate-800 cursor-pointer"
              />
              <span className="text-2xs text-slate-500 mt-1 block">
                Tax amount: {formatCurrencyValue(summary.taxAmount, currency)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
