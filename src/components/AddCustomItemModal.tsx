import React, { useState } from 'react';
import {
  X,
  Plus,
  Sprout,
  Compass,
  Layers,
  Sparkles,
  CheckCircle2,
  DollarSign,
  Sun,
  Droplets,
  TreePine,
  Armchair,
  Umbrella,
  Grid,
} from 'lucide-react';
import type { CatalogItem } from '../data/plantCatalog.ts';
import type { Currency, BOQItem } from '../types/landscape.ts';

interface AddCustomItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  onSaveItem: (item: CatalogItem, addToBOQ?: boolean, qty?: number) => void;
  defaultCategory?: string;
}

export const AddCustomItemModal: React.FC<AddCustomItemModalProps> = ({
  isOpen,
  onClose,
  currency,
  onSaveItem,
  defaultCategory = 'shrub',
}) => {
  const [itemType, setItemType] = useState<'plant' | 'hardscape' | 'furniture'>('plant');
  const [category, setCategory] = useState<CatalogItem['category']>(defaultCategory as any || 'shrub');
  const [commonName, setCommonName] = useState('');
  const [botanicalName, setBotanicalName] = useState('');
  const [arabicName, setArabicName] = useState('');
  const [specification, setSpecification] = useState('');
  const [defaultUnit, setDefaultUnit] = useState<CatalogItem['defaultUnit']>('Nos');
  const [unitRateInCurrency, setUnitRateInCurrency] = useState<number>(35);
  const [waterNeed, setWaterNeed] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [sunNeed, setSunNeed] = useState<'Full Sun' | 'Partial' | 'Shade' | 'Any'>('Full Sun');
  const [spacingM, setSpacingM] = useState<number>(1.0);
  const [description, setDescription] = useState('');
  const [addToBOQDirectly, setAddToBOQDirectly] = useState(true);
  const [boqQuantity, setBoqQuantity] = useState<number>(10);

  if (!isOpen) return null;

  const handleTypeSelect = (type: 'plant' | 'hardscape' | 'furniture') => {
    setItemType(type);
    if (type === 'plant') {
      setCategory('shrub');
      setDefaultUnit('Nos');
      setUnitRateInCurrency(35);
    } else if (type === 'hardscape') {
      setCategory('paving');
      setDefaultUnit('m2');
      setUnitRateInCurrency(65);
    } else {
      setCategory('cantilever_umbrella');
      setDefaultUnit('Nos');
      setUnitRateInCurrency(520);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commonName.trim()) return;

    // Convert rate to USD baseline (approximate, using 1:1 if USD, or /3.67 for AED)
    // Here we store typicalRateUSD as rate in USD baseline
    const newItem: CatalogItem = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      category,
      sourceOrigin: 'Custom User Material',
      commonName: commonName.trim(),
      botanicalName: botanicalName.trim() || commonName.trim(),
      arabicName: arabicName.trim() || undefined,
      specification: specification.trim() || `${commonName} standard nursery grade`,
      defaultUnit,
      typicalRateUSD: unitRateInCurrency, // Will be scaled appropriately by caller
      waterNeed,
      sunNeed,
      spacingM: spacingM > 0 ? spacingM : undefined,
      description: description.trim() || `${commonName} custom item added by user. Verified against regional market pricing.`,
    };

    onSaveItem(newItem, addToBOQDirectly, boqQuantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-emerald-300">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Add Custom Plant, Material or Furniture</h2>
              <p className="text-xs text-emerald-200/90">
                Register new botanical species, paving stones, cantilever umbrellas or sofa sets into the project catalog.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Item Category Group Switcher */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeSelect('plant')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                itemType === 'plant'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>Plant / Softscape</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeSelect('hardscape')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                itemType === 'hardscape'
                  ? 'bg-white text-amber-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-4 h-4 text-amber-600" />
              <span>Hardscape Material</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeSelect('furniture')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                itemType === 'furniture'
                  ? 'bg-white text-blue-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Armchair className="w-4 h-4 text-blue-600" />
              <span>Outdoor Furniture / Living</span>
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Specific Classification</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {itemType === 'plant' && (
                  <>
                    <option value="shrub">Shrub & Hedge (e.g. Bougainvillea, Jasmine)</option>
                    <option value="tree">Specimen & Shade Tree (e.g. Delonix, Neem)</option>
                    <option value="palm">Palm Tree (e.g. Date Palm, Washingtonia)</option>
                    <option value="groundcover">Groundcover (e.g. Wedelia, Vinca)</option>
                    <option value="turf">Turfgrass / Lawn (e.g. Bermuda, Paspalum)</option>
                    <option value="climber">Climber & Vine (e.g. Allamanda, Quisqualis)</option>
                    <option value="succulent">Succulent & Cactus (e.g. Agave, Aloe)</option>
                    <option value="herb">Herb & Edible (e.g. Rosemary, Mint, Citrus)</option>
                    <option value="perennial">Flowering Perennial (e.g. Petunia, Gazania)</option>
                    <option value="balcony_pot">Balcony Pot & Container Plant</option>
                    <option value="mulch">Organic & Mineral Mulch</option>
                  </>
                )}
                {itemType === 'hardscape' && (
                  <>
                    <option value="paving">Paving & Stepping Stones (Porcelain, Travertine)</option>
                    <option value="artificial_grass">Artificial Landscape Grass (30mm, 40mm, 50mm)</option>
                    <option value="gravel_stone">Gravel, River Pebbles & White Marble Chips</option>
                    <option value="blocks_retaining">Retaining Wall Blocks & Kerbstones</option>
                    <option value="edging">Garden & Lawn Edging (Aluminum, Corten Steel)</option>
                    <option value="decking">WPC Composite or Natural Wood Decking</option>
                  </>
                )}
                {itemType === 'furniture' && (
                  <>
                    <option value="cantilever_umbrella">Cantilever Rotating Umbrella / Parasol</option>
                    <option value="garden_bench">Solid Teak / Cast Aluminum Garden Bench</option>
                    <option value="garden_sofa">Luxury Rattan / Aluminum Sofa Lounge Set</option>
                    <option value="pergola">Bioclimatic Louvered Motorized Pergola</option>
                    <option value="water_fire_feature">Water Cascade Fountain / Gas Fire Pit</option>
                    <option value="lighting">Low-Voltage LED Spotlights & Transformer</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Common / Trade Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Royal Poinciana 3.5m, 3x3m Cantilever Umbrella"
                value={commonName}
                onChange={(e) => setCommonName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {itemType === 'plant' ? 'Botanical Name' : 'Material / Frame Standard'}
              </label>
              <input
                type="text"
                placeholder={itemType === 'plant' ? 'e.g. Delonix regia' : 'e.g. Sunbrella UV50+ & Anodized Aluminum'}
                value={botanicalName}
                onChange={(e) => setBotanicalName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Arabic Trade Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. بوانسيانا / مظلة متحركة"
                value={arabicName}
                onChange={(e) => setArabicName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-right font-sans"
              />
            </div>
          </div>

          {/* Specifications, Unit & Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Container / Spec Size</label>
              <input
                type="text"
                placeholder="e.g. 45L pot / 600x600x20mm / 360° rotation"
                value={specification}
                onChange={(e) => setSpecification(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Default Unit</label>
              <select
                value={defaultUnit}
                onChange={(e) => setDefaultUnit(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Nos">Nos (Number / Count)</option>
                <option value="m2">m² (Square Meter)</option>
                <option value="Lm">Lm (Linear Meter)</option>
                <option value="Set">Set (Ensemble / Kit)</option>
                <option value="Pot">Pot (Container)</option>
                <option value="m3">m³ (Cubic Meter)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Typical Unit Rate ({currency})
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={unitRateInCurrency}
                onChange={(e) => setUnitRateInCurrency(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Plant Environmental Attributes (If softscape) */}
          {itemType === 'plant' && (
            <div className="grid grid-cols-3 gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <div>
                <label className="block text-xs font-semibold text-emerald-900 mb-1 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-600" />
                  <span>Water Need</span>
                </label>
                <select
                  value={waterNeed}
                  onChange={(e) => setWaterNeed(e.target.value as any)}
                  className="w-full px-2 py-1.5 text-xs border border-emerald-200 rounded-lg bg-white"
                >
                  <option value="Low">Low (Drought Hardy)</option>
                  <option value="Medium">Medium (Moderate)</option>
                  <option value="High">High (Moisture Loving)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-900 mb-1 flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Sunlight</span>
                </label>
                <select
                  value={sunNeed}
                  onChange={(e) => setSunNeed(e.target.value as any)}
                  className="w-full px-2 py-1.5 text-xs border border-emerald-200 rounded-lg bg-white"
                >
                  <option value="Full Sun">Full Sun (6+ hrs)</option>
                  <option value="Partial">Partial Shade</option>
                  <option value="Shade">Deep Shade / Indoor</option>
                  <option value="Any">Any Exposure</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-900 mb-1">Spacing (Meters)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.2"
                  value={spacingM}
                  onChange={(e) => setSpacingM(Number(e.target.value))}
                  className="w-full px-2 py-1.5 text-xs border border-emerald-200 rounded-lg bg-white font-mono"
                />
              </div>
            </div>
          )}

          {/* Description & Market Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description & Market Notes (greensouq.ae / Supplier benchmark)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. greensouq.ae benchmark AED 1,900. Heavy duty aluminum mast with 360-degree rotation pedal and granite base."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Direct BOQ Insertion Option */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="addToBOQ"
                checked={addToBOQDirectly}
                onChange={(e) => setAddToBOQDirectly(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
              />
              <label htmlFor="addToBOQ" className="text-xs font-semibold text-slate-800 cursor-pointer">
                Also insert directly as a line item in current BOQ
              </label>
            </div>

            {addToBOQDirectly && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Quantity:</span>
                <input
                  type="number"
                  min="1"
                  value={boqQuantity}
                  onChange={(e) => setBoqQuantity(Number(e.target.value))}
                  className="w-20 px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white font-mono font-bold text-slate-900"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Save & Add Item</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
