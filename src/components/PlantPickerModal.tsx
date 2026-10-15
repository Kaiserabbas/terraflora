import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Check,
  Plus,
  Sprout,
  Sun,
  Droplets,
  Layers,
  Sparkles,
  TreePine,
  CheckCircle2,
} from 'lucide-react';
import { PLANT_CATALOG, CatalogItem } from '../data/plantCatalog.ts';
import type { Currency, BOQItem } from '../types/landscape.ts';
import { formatCurrencyValue } from '../utils/calculations.ts';

interface PlantPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  categoryFilter?: string; // e.g. 'turf', 'shrub', 'tree', 'groundcover', 'paving', 'furniture'
  selectedSpecies: string[];
  onSelectSpecies: (speciesName: string, item?: CatalogItem) => void;
  onRemoveSpecies?: (speciesName: string) => void;
  currency: Currency;
  onAddBOQItem?: (item: Omit<BOQItem, 'id' | 'amount'>) => void;
  customItems?: CatalogItem[];
}

export const PlantPickerModal: React.FC<PlantPickerModalProps> = ({
  isOpen,
  onClose,
  title,
  categoryFilter,
  selectedSpecies,
  onSelectSpecies,
  onRemoveSpecies,
  currency,
  onAddBOQItem,
  customItems = [],
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(categoryFilter || 'all');
  const [addedBOQIds, setAddedBOQIds] = useState<Record<string, boolean>>({});

  // Merge default catalog and custom items
  const allItems = useMemo(() => {
    return [...customItems, ...PLANT_CATALOG];
  }, [customItems]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // Category match
      let matchesCat = true;
      if (activeCategory !== 'all') {
        if (activeCategory === 'trees_palms') {
          matchesCat = item.category === 'tree' || item.category === 'palm';
        } else if (activeCategory === 'shrubs_hedges') {
          matchesCat = item.category === 'shrub' || item.category === 'climber' || item.category === 'perennial';
        } else if (activeCategory === 'groundcover_mulch') {
          matchesCat = item.category === 'groundcover' || item.category === 'mulch' || item.category === 'succulent';
        } else if (activeCategory === 'hardscape_materials') {
          matchesCat =
            item.category === 'paving' ||
            item.category === 'artificial_grass' ||
            item.category === 'gravel_stone' ||
            item.category === 'blocks_retaining' ||
            item.category === 'edging';
        } else if (activeCategory === 'furniture_amenities') {
          matchesCat =
            item.category === 'cantilever_umbrella' ||
            item.category === 'garden_bench' ||
            item.category === 'garden_sofa' ||
            item.category === 'pergola' ||
            item.category === 'water_fire_feature';
        } else {
          matchesCat = item.category === activeCategory;
        }
      }

      const q = search.toLowerCase();
      const matchesSearch =
        q === '' ||
        item.commonName.toLowerCase().includes(q) ||
        item.botanicalName.toLowerCase().includes(q) ||
        (item.arabicName && item.arabicName.includes(q)) ||
        item.specification.toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });
  }, [allItems, activeCategory, search]);

  if (!isOpen) return null;

  const handleToggleSurvey = (item: CatalogItem) => {
    const fullName = `${item.commonName} (${item.botanicalName})`;
    const isSelected = selectedSpecies.some((s) => s.includes(item.commonName) || fullName === s);

    if (isSelected && onRemoveSpecies) {
      onRemoveSpecies(fullName);
    } else {
      onSelectSpecies(fullName, item);
    }
  };

  const handleAddDirectToBOQ = (item: CatalogItem) => {
    if (!onAddBOQItem) return;

    let section: BOQItem['section'] = 'B_SOFTSCAPE';
    if (
      item.category === 'paving' ||
      item.category === 'artificial_grass' ||
      item.category === 'gravel_stone' ||
      item.category === 'blocks_retaining' ||
      item.category === 'edging' ||
      item.category === 'cantilever_umbrella' ||
      item.category === 'garden_bench' ||
      item.category === 'garden_sofa' ||
      item.category === 'pergola' ||
      item.category === 'water_fire_feature' ||
      item.category === 'balcony_pot'
    ) {
      section = 'D_HARDSCAPE';
    } else if (item.category === 'irrigation') {
      section = 'C_IRRIGATION';
    }

    onAddBOQItem({
      section,
      itemCode: `${section[0]}-${Math.floor(10 + Math.random() * 89)}`,
      category: item.category.toUpperCase().replace('_', ' '),
      description: `${item.commonName}${item.arabicName ? ` (${item.arabicName})` : ''} - ${item.botanicalName}`,
      specification: item.specification,
      quantity: item.defaultUnit === 'm2' ? 50 : item.defaultUnit === 'Nos' ? 5 : 1,
      unit: item.defaultUnit as any,
      unitRate: item.typicalRateUSD,
    });

    setAddedBOQIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedBOQIds((prev) => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-5 text-white shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-emerald-300">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">{title}</h2>
              <p className="text-xs text-emerald-200/90">
                Browse verified botanical and material items from UAE Plants & Balcony Catalogs. Click to select.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search common name, botanical name, or arabic name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
                  activeCategory === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('shrubs_hedges')}
                className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
                  activeCategory === 'shrubs_hedges'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Shrubs & Hedges
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('trees_palms')}
                className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
                  activeCategory === 'trees_palms'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Trees & Palms
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('groundcover_mulch')}
                className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
                  activeCategory === 'groundcover_mulch'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Groundcover & Mulch
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('hardscape_materials')}
                className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
                  activeCategory === 'hardscape_materials'
                    ? 'bg-amber-800 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Paving & Stones
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('furniture_amenities')}
                className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
                  activeCategory === 'furniture_amenities'
                    ? 'bg-blue-800 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Furniture & Umbrellas
              </button>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No matching plants or materials found for "{search}".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredItems.map((item) => {
                const fullName = `${item.commonName} (${item.botanicalName})`;
                const isSelectedInSurvey = selectedSpecies.some(
                  (s) => s.includes(item.commonName) || s === fullName
                );
                const isAddedToBOQ = !!addedBOQIds[item.id];

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-3.5 transition-all flex flex-col justify-between gap-3 ${
                      isSelectedInSurvey
                        ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.commonName}</h4>
                            {item.arabicName && (
                              <span className="text-[11px] font-medium text-slate-500 font-sans">
                                ({item.arabicName})
                              </span>
                            )}
                          </div>
                          <span className="text-xs italic text-emerald-800 font-mono block">
                            {item.botanicalName}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase shrink-0">
                          {item.category.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2">{item.specification}</p>

                      <div className="flex items-center gap-2 pt-1 text-[11px]">
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 font-medium">
                          Water: {item.waterNeed}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-medium">
                          Sun: {item.sunNeed}
                        </span>
                        <span className="ml-auto font-mono font-bold text-slate-900 text-xs">
                          {formatCurrencyValue(item.typicalRateUSD, currency)} / {item.defaultUnit}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleSurvey(item)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                          isSelectedInSurvey
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        }`}
                      >
                        {isSelectedInSurvey ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Selected for Survey</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Select for Survey</span>
                          </>
                        )}
                      </button>

                      {onAddBOQItem && (
                        <button
                          type="button"
                          onClick={() => handleAddDirectToBOQ(item)}
                          className={`flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all shrink-0 ${
                            isAddedToBOQ
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          }`}
                        >
                          {isAddedToBOQ ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added!</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add to BOQ</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {selectedSpecies.length} species selected in survey brief
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
