import React, { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  Plus,
  Check,
  Droplets,
  Sun,
  Maximize2,
  Trees,
  Sprout,
  Sparkles,
  Flower2,
  TreePine,
  CheckCircle2,
  Armchair,
  Umbrella,
  Grid,
  Filter,
} from 'lucide-react';
import { PLANT_CATALOG, CatalogItem } from '../data/plantCatalog.ts';
import type { BOQItem, Currency } from '../types/landscape.ts';
import { formatCurrencyValue } from '../utils/calculations.ts';
import { AddCustomItemModal } from './AddCustomItemModal.tsx';

interface PlantPaletteViewProps {
  currency: Currency;
  onAddItemToBOQ: (item: Omit<BOQItem, 'id' | 'amount'>) => void;
  customItems?: CatalogItem[];
  onAddCustomItem?: (item: CatalogItem, addToBOQ?: boolean, qty?: number) => void;
}

export const PlantPaletteView: React.FC<PlantPaletteViewProps> = ({
  currency,
  onAddItemToBOQ,
  customItems = [],
  onAddCustomItem,
}) => {
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Combine static and custom items
  const combinedCatalog = useMemo(() => {
    return [...customItems, ...PLANT_CATALOG];
  }, [customItems]);

  const sources = [
    { id: 'all', name: 'All Catalogs', count: combinedCatalog.length },
    {
      id: 'UAE Plants Directory',
      name: '🇦🇪 UAE Plants (uae-plants.vercel.app)',
      count: combinedCatalog.filter((i) => i.sourceOrigin === 'UAE Plants Directory').length,
    },
    {
      id: 'Balcony & Patio Catalog',
      name: '🪴 Balcony & Pots (balcony-catalog.vercel.app)',
      count: combinedCatalog.filter((i) => i.sourceOrigin === 'Balcony & Patio Catalog').length,
    },
    {
      id: 'Greensouq Market',
      name: '🛍️ Greensouq Hardscape & Furniture',
      count: combinedCatalog.filter((i) => i.sourceOrigin === 'Greensouq Market').length,
    },
    {
      id: 'Rain Bird Irrigation',
      name: '💧 Rain Bird Hardware',
      count: combinedCatalog.filter((i) => i.sourceOrigin === 'Rain Bird Irrigation').length,
    },
    {
      id: 'Turfgrass Standard',
      name: '🌱 Turfgrasses & Mulch',
      count: combinedCatalog.filter((i) => i.sourceOrigin === 'Turfgrass Standard').length,
    },
    {
      id: 'Custom User Material',
      name: '➕ My Custom Items',
      count: customItems.length,
    },
  ];

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'tree', name: 'Trees' },
    { id: 'palm', name: 'Palms' },
    { id: 'shrub', name: 'Shrubs & Bushes' },
    { id: 'climber', name: 'Climbers' },
    { id: 'groundcover', name: 'Ground Covers' },
    { id: 'perennial', name: 'Flowers & Perennials' },
    { id: 'herb', name: 'Herbs & Edibles' },
    { id: 'succulent', name: 'Succulents' },
    { id: 'balcony_pot', name: 'Balcony Pots & Containers' },
    { id: 'turf', name: 'Turfgrass' },
    { id: 'mulch', name: 'Mulch & Mineral' },
    { id: 'paving', name: 'Paving & Stepping Stones' },
    { id: 'artificial_grass', name: 'Artificial Grass (30-50mm)' },
    { id: 'gravel_stone', name: 'Gravel & River Pebbles' },
    { id: 'blocks_retaining', name: 'Retaining Blocks & Kerbs' },
    { id: 'cantilever_umbrella', name: 'Cantilever Umbrellas' },
    { id: 'garden_bench', name: 'Garden Benches' },
    { id: 'garden_sofa', name: 'Garden Sofa Sets' },
    { id: 'pergola', name: 'Louvered Pergolas' },
    { id: 'water_fire_feature', name: 'Fountains & Fire Pits' },
    { id: 'lighting', name: 'Landscape Lighting' },
    { id: 'irrigation', name: 'Rain Bird Irrigation' },
  ];

  const filteredItems = useMemo(() => {
    return combinedCatalog.filter((item) => {
      const matchesSource = selectedSource === 'all' || item.sourceOrigin === selectedSource;
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        item.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.botanicalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.arabicName && item.arabicName.includes(searchQuery)) ||
        (item.family && item.family.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.specification.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSource && matchesCategory && matchesSearch;
    });
  }, [combinedCatalog, selectedSource, selectedCategory, searchQuery]);

  const handleAdd = (item: CatalogItem) => {
    let section: BOQItem['section'] = 'B_SOFTSCAPE';
    if (item.category === 'irrigation') section = 'C_IRRIGATION';
    if (item.category === 'mulch') section = 'B_SOFTSCAPE';
    if (
      item.category === 'paving' ||
      item.category === 'artificial_grass' ||
      item.category === 'gravel_stone' ||
      item.category === 'blocks_retaining' ||
      item.category === 'edging' ||
      item.category === 'decking' ||
      item.category === 'cantilever_umbrella' ||
      item.category === 'garden_bench' ||
      item.category === 'garden_sofa' ||
      item.category === 'pergola' ||
      item.category === 'water_fire_feature' ||
      item.category === 'lighting' ||
      item.category === 'balcony_pot'
    ) {
      section = 'D_HARDSCAPE';
    }

    onAddItemToBOQ({
      section,
      itemCode: `${section[0]}-${Math.floor(10 + Math.random() * 89)}`,
      category: item.category.toUpperCase().replace('_', ' '),
      description: `${item.commonName}${item.arabicName ? ` (${item.arabicName})` : ''} - ${item.botanicalName}`,
      specification: item.specification,
      quantity: item.defaultUnit === 'm2' ? 50 : item.defaultUnit === 'Nos' ? 5 : 1,
      unit: item.defaultUnit as any,
      unitRate: item.typicalRateUSD,
    });

    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  Comprehensive Master Library
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500 font-mono">
                  {combinedCatalog.length} verified plants, materials & furniture
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                Plant Palette, Hardscape & Outdoor Living Catalog
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search plants, umbrellas, sofas..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
              />
            </div>

            {/* Add New Plant / Item Button */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Plant / Material</span>
            </button>
          </div>
        </div>

        {/* Source Catalog Filter Tabs */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {sources.map((src) => (
            <button
              key={src.id}
              type="button"
              onClick={() => setSelectedSource(src.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                selectedSource === src.id
                  ? 'bg-amber-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span>{src.name}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  selectedSource === src.id ? 'bg-amber-700 text-amber-100' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {src.count}
              </span>
            </button>
          ))}
        </div>

        {/* Category Filter Chips */}
        <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Catalog Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const isAdded = !!addedIds[item.id];
          const isFurniture =
            item.category === 'cantilever_umbrella' ||
            item.category === 'garden_bench' ||
            item.category === 'garden_sofa' ||
            item.category === 'pergola' ||
            item.category === 'water_fire_feature';
          const isHardscape =
            item.category === 'paving' ||
            item.category === 'artificial_grass' ||
            item.category === 'gravel_stone' ||
            item.category === 'blocks_retaining' ||
            item.category === 'edging';

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4.5 hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Badges */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isFurniture
                          ? 'bg-blue-100 text-blue-800'
                          : isHardscape
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.category.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {item.sourceOrigin}
                    </span>
                  </div>

                  {item.arabicName && (
                    <span className="text-xs font-semibold text-slate-500 font-sans" dir="rtl">
                      {item.arabicName}
                    </span>
                  )}
                </div>

                {/* Common Name */}
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {item.commonName}
                </h3>

                {/* Botanical Name / Standard */}
                <p className="text-xs italic text-emerald-700 font-mono mt-0.5 mb-2.5">
                  {item.botanicalName}
                </p>

                {/* Specification */}
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed mb-3">
                  <span className="font-semibold text-slate-700">Spec:</span> {item.specification}
                </p>

                {/* Cultural Requirements or Material Details */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    <span>Water: <strong className="text-slate-800">{item.waterNeed}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Sun: <strong className="text-slate-800">{item.sunNeed}</strong></span>
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">greensouq.ae rate</span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {formatCurrencyValue(item.typicalRateUSD, currency)}{' '}
                    <span className="text-xs font-normal text-slate-500">/ {item.defaultUnit}</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleAdd(item)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added to BOQ</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to BOQ</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700">No items matched your filter criteria.</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting the search query or selecting a different category.</p>
        </div>
      )}

      {/* Add Custom Item Modal */}
      <AddCustomItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        currency={currency}
        onSaveItem={(newItem, addToBOQ, qty) => {
          if (onAddCustomItem) {
            onAddCustomItem(newItem, addToBOQ, qty);
          }
        }}
      />
    </div>
  );
};
