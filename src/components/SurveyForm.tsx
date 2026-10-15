import React, { useState } from 'react';
import {
  ClipboardList,
  Trees,
  Sprout,
  Sun,
  Droplets,
  Gauge,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  Maximize2,
  Compass,
  FileCheck,
  Armchair,
  Umbrella,
  Grid,
  Plus,
  Layers,
  TreePine,
  Search,
} from 'lucide-react';
import type {
  SiteSurveyData,
  SoilTextureType,
  SlopeCategory,
  SunExposure,
  WindCondition,
  WaterSourceType,
  Currency,
  BOQItem,
} from '../types/landscape.ts';
import type { CatalogItem } from '../data/plantCatalog.ts';
import {
  calculateSafeWaterCapacityRules,
  getMaxPrecipitationRate,
  getSoilAvailableWater,
  formatCurrencyValue,
} from '../utils/calculations.ts';
import { PlantPickerModal } from './PlantPickerModal.tsx';
import { AddCustomItemModal } from './AddCustomItemModal.tsx';

interface SurveyFormProps {
  survey: SiteSurveyData;
  onChange: (updated: SiteSurveyData) => void;
  onGenerateBOQ: () => void;
  onOpenAIAdvisor?: () => void;
  currency?: Currency;
  onAddBOQItem?: (item: Omit<BOQItem, 'id' | 'amount'>) => void;
  customItems?: CatalogItem[];
  onAddCustomItem?: (item: CatalogItem, addToBOQ?: boolean, qty?: number) => void;
}

export const SurveyForm: React.FC<SurveyFormProps> = ({
  survey,
  onChange,
  onGenerateBOQ,
  onOpenAIAdvisor,
  currency = 'AED',
  onAddBOQItem,
  customItems = [],
  onAddCustomItem,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'project' | 'plantation' | 'hardscape' | 'environment' | 'water' | 'notes'>('project');
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);

  // Plant Picker Modal state
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerConfig, setPickerConfig] = useState<{
    title: string;
    categoryFilter?: string;
    selectedSpecies: string[];
    onSelect: (species: string, item?: CatalogItem) => void;
    onRemove?: (species: string) => void;
  }>({
    title: 'Select Plants from Palette',
    selectedSpecies: [],
    onSelect: () => {},
  });

  // Custom Item Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalCategory, setAddModalCategory] = useState<string>('shrub');

  const updateField = <K extends keyof SiteSurveyData>(key: K, value: SiteSurveyData[K]) => {
    onChange({
      ...survey,
      [key]: value,
    });
  };

  const handleSyncClick = () => {
    onGenerateBOQ();
    setShowSyncSuccess(true);
    setTimeout(() => setShowSyncSuccess(false), 4000);
  };

  const soilInfo = getSoilAvailableWater(survey.soilTexture);
  const maxPR = getMaxPrecipitationRate(survey.soilTexture, survey.slopeCategory, true);
  const waterCap = calculateSafeWaterCapacityRules(
    survey.staticPressureBar,
    survey.waterMeterSizeInch,
    survey.serviceLineSizeMm
  );

  return (
    <div className="space-y-6">
      {/* Top Banner with Action & Quick Stats */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Landscape Site Survey & Client Questionnaire
              </h1>
              <p className="text-sm text-slate-500">
                Record field measurements, client plantation preferences, hardscape materials, and Rain Bird water hydraulics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {onOpenAIAdvisor && (
              <button
                type="button"
                onClick={onOpenAIAdvisor}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>AI Site Analysis</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSyncClick}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs hover:shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Auto-Calculate & Sync with BOQ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showSyncSuccess && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs sm:text-sm text-emerald-800 flex items-center justify-between transition-all">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Site survey specifications successfully synced! All quantities (soil, turf, shrubs, trees, Rain Bird valves, pipes, labor) updated in the BOQ.
              </span>
            </div>
            <span className="text-xs font-semibold text-emerald-700">Ready in BOQ Sheet</span>
          </div>
        )}

        {/* Survey Section Navigation Pill Tabs */}
        <div className="flex items-center gap-1.5 mt-5 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveSubTab('project')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeSubTab === 'project'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>1. Project Profile & Areas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('plantation')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeSubTab === 'plantation'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trees className="w-3.5 h-3.5 text-emerald-600" />
            <span>2. Plantation Preferences</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('hardscape')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeSubTab === 'hardscape'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Armchair className="w-3.5 h-3.5 text-amber-600" />
            <span>3. Hardscape & Furniture</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('environment')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeSubTab === 'environment'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-600" />
            <span>4. Soil & Environment</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('water')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeSubTab === 'water'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-blue-600" />
            <span>5. Rain Bird Water Supply</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('notes')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeSubTab === 'notes'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>6. Client Notes & Constraints</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: PROJECT PROFILE & SITE AREAS */}
      {activeSubTab === 'project' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">Project & Client Information</h2>
            <p className="text-xs text-slate-500">General site particulars and contract administration records.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Project Name</label>
              <input
                type="text"
                value={survey.projectName}
                onChange={(e) => updateField('projectName', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Project Code / Reference</label>
              <input
                type="text"
                value={survey.projectNumber}
                onChange={(e) => updateField('projectNumber', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Project Type</label>
              <select
                value={survey.projectType}
                onChange={(e) => updateField('projectType', e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="residential_villa">Private Residential Villa Garden</option>
                <option value="commercial">Commercial / Corporate Campus</option>
                <option value="park_public">Public Park / Municipal Turf</option>
                <option value="rooftop_garden">Rooftop Terrace / Penthouse</option>
                <option value="resort_hotel">Hospitality Resort & Spa</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Client Full Name</label>
              <input
                type="text"
                value={survey.clientName}
                onChange={(e) => updateField('clientName', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Client Phone Number</label>
              <input
                type="text"
                value={survey.clientPhone}
                onChange={(e) => updateField('clientPhone', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Client Email Address</label>
              <input
                type="email"
                value={survey.clientEmail}
                onChange={(e) => updateField('clientEmail', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Site Physical Location / Address</label>
              <input
                type="text"
                value={survey.siteAddress}
                onChange={(e) => updateField('siteAddress', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Survey Date</label>
              <input
                type="date"
                value={survey.surveyDate}
                onChange={(e) => updateField('surveyDate', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Surveyor / Landscape Architect</label>
              <input
                type="text"
                value={survey.surveyorName}
                onChange={(e) => updateField('surveyorName', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Execution Timeline (Weeks)</label>
              <input
                type="number"
                min="1"
                max="52"
                value={survey.targetTimelineWeeks}
                onChange={(e) => updateField('targetTimelineWeeks', Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Site Area Measurements (m²)</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter the measured zones. The system uses these to automatically size topsoil volumes, sod rolls, dripline runs, and sprinkler head layouts.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="block text-xs font-medium text-slate-500 mb-1">Total Plot Area</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="10"
                    value={survey.totalPlotAreaM2}
                    onChange={(e) => updateField('totalPlotAreaM2', Number(e.target.value))}
                    className="w-full text-base font-bold text-slate-900 bg-white border border-slate-300 rounded-md px-2 py-1 font-mono"
                  />
                  <span className="text-xs text-slate-500 font-semibold">m²</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
                <span className="block text-xs font-medium text-emerald-800 mb-1">Total Landscape Area</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="10"
                    value={survey.totalLandscapeAreaM2}
                    onChange={(e) => updateField('totalLandscapeAreaM2', Number(e.target.value))}
                    className="w-full text-base font-bold text-emerald-950 bg-white border border-emerald-300 rounded-md px-2 py-1 font-mono"
                  />
                  <span className="text-xs text-emerald-700 font-semibold">m²</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-green-50/50 border border-green-200/80">
                <span className="block text-xs font-medium text-green-800 mb-1">Lawn / Turf Area</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    value={survey.turfAreaM2}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateField('turfAreaM2', val);
                      updateField('turfPreference', { ...survey.turfPreference, areaM2: val });
                    }}
                    className="w-full text-base font-bold text-green-950 bg-white border border-green-300 rounded-md px-2 py-1 font-mono"
                  />
                  <span className="text-xs text-green-700 font-semibold">m²</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-teal-50/50 border border-teal-200/80">
                <span className="block text-xs font-medium text-teal-800 mb-1">Planting Beds & Shrubs</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    value={survey.plantingBedsAreaM2}
                    onChange={(e) => updateField('plantingBedsAreaM2', Number(e.target.value))}
                    className="w-full text-base font-bold text-teal-950 bg-white border border-teal-300 rounded-md px-2 py-1 font-mono"
                  />
                  <span className="text-xs text-teal-700 font-semibold">m²</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="block text-xs font-medium text-slate-600 mb-1">Hardscape / Paving</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    value={survey.hardscapeAreaM2}
                    onChange={(e) => updateField('hardscapeAreaM2', Number(e.target.value))}
                    className="w-full text-base font-bold text-slate-900 bg-white border border-slate-300 rounded-md px-2 py-1 font-mono"
                  />
                  <span className="text-xs text-slate-500 font-semibold">m²</span>
                </div>
              </div>
            </div>

            {survey.turfAreaM2 + survey.plantingBedsAreaM2 + survey.hardscapeAreaM2 !== survey.totalLandscapeAreaM2 && (
              <p className="text-xs text-amber-700 mt-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Note: Sub-zones sum ({survey.turfAreaM2 + survey.plantingBedsAreaM2 + survey.hardscapeAreaM2} m²) differs from Total Landscape Area ({survey.totalLandscapeAreaM2} m²). Sub-zones will be used for itemized quantities.
                </span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CLIENT PLANTATION PREFERENCES */}
      {activeSubTab === 'plantation' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">Client Plantation & Softscape Brief</h2>
            <p className="text-xs text-slate-500">
              Note down client expectations for lawn grass, hedges, ornamental shrubs, specimen trees, palms, and ground covers.
            </p>
          </div>

          {/* Grass / Lawn Section */}
          <div className="p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sprout className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">1. Grass & Turf Specifications</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPickerConfig({
                    title: 'Select Turfgrass or Artificial Grass from Palette',
                    categoryFilter: 'turf',
                    selectedSpecies: [survey.turfPreference.selectedType],
                    onSelect: (name, item) => {
                      if (item) {
                        updateField('turfPreference', {
                          ...survey.turfPreference,
                          selectedType: item.commonName,
                          installationMethod: item.id.includes('art') || item.id.includes('synth') ? 'artificial' : 'sod_rolls',
                        });
                      }
                    },
                  });
                  setIsPickerOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition-colors cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-emerald-700" />
                <span>Browse Turf Catalog (Living & Artificial)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Grass / Turf Type Requested</label>
                <select
                  value={survey.turfPreference.selectedType}
                  onChange={(e) =>
                    updateField('turfPreference', {
                      ...survey.turfPreference,
                      selectedType: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                >
                  <option value="Bermuda Grass (Tifway 419)">Bermuda Grass (Tifway 419) - Heat & Traffic Hardy</option>
                  <option value="Seashore Paspalum (Platinum TE)">Seashore Paspalum (Platinum TE) - High Salinity Tolerant</option>
                  <option value="Zoysia Grass (Zeon / El Toro)">Zoysia Grass (Zeon / El Toro) - Carpet Soft, Shade Tolerant</option>
                  <option value="Kentucky Bluegrass / Rye Blend">Kentucky Bluegrass / Rye Blend - Temperate Climate</option>
                  <option value="Premium Landscape Artificial Turf 40mm">Premium Artificial Turf 40mm - Zero Water / Shaded</option>
                  <option value="Ultra-Lush 50mm Resort Synthetic Turf">Ultra-Lush 50mm Resort Synthetic Turf</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lawn Installation Method</label>
                <select
                  value={survey.turfPreference.installationMethod}
                  onChange={(e) =>
                    updateField('turfPreference', {
                      ...survey.turfPreference,
                      installationMethod: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                >
                  <option value="sod_rolls">Fresh Cultivated Sod Rolls (Instant Green)</option>
                  <option value="stolons">Sprigging / Stolons (Economy Growing)</option>
                  <option value="artificial">Synthetic Turf with Shockpad & Sand Infill</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Usage & Traffic Intensity</label>
                <select
                  value={survey.turfPreference.usageIntensity}
                  onChange={(e) =>
                    updateField('turfPreference', {
                      ...survey.turfPreference,
                      usageIntensity: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                >
                  <option value="high_traffic">High Traffic (Children playing, dogs, entertaining)</option>
                  <option value="moderate">Moderate Residential Activity</option>
                  <option value="ornamental_low">Ornamental Visual Display Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bushes & Shrubs Section */}
          <div className="p-4 rounded-xl border border-teal-200/80 bg-teal-50/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trees className="w-4 h-4 text-teal-700" />
                <h3 className="text-sm font-bold text-slate-900">2. Bushes, Hedges & Flowering Shrubs</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPickerConfig({
                    title: 'Pick Shrubs & Hedges from Plant Palette (250+ UAE & Balcony Varieties)',
                    categoryFilter: 'shrubs_hedges',
                    selectedSpecies: survey.shrubPreferences.preferredSpecies,
                    onSelect: (name) => {
                      if (!survey.shrubPreferences.preferredSpecies.includes(name)) {
                        updateField('shrubPreferences', {
                          ...survey.shrubPreferences,
                          preferredSpecies: [...survey.shrubPreferences.preferredSpecies, name],
                        });
                      }
                    },
                    onRemove: (name) => {
                      updateField('shrubPreferences', {
                        ...survey.shrubPreferences,
                        preferredSpecies: survey.shrubPreferences.preferredSpecies.filter((s) => s !== name),
                      });
                    },
                  });
                  setIsPickerOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-100 hover:bg-teal-200 text-teal-900 text-xs font-bold transition-colors cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-teal-700" />
                <span>Browse Plant Palette (250+ Varieties)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Perimeter Hedge Length (Linear Meters)</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    value={survey.shrubPreferences.hedgeLengthLm}
                    onChange={(e) =>
                      updateField('shrubPreferences', {
                        ...survey.shrubPreferences,
                        hedgeLengthLm: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-mono bg-white"
                  />
                  <span className="text-xs text-slate-500 font-semibold">Lm</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hedge Height & Privacy Tier</label>
                <select
                  value={survey.shrubPreferences.hedgeHeightCategory}
                  onChange={(e) =>
                    updateField('shrubPreferences', {
                      ...survey.shrubPreferences,
                      hedgeHeightCategory: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden bg-white"
                >
                  <option value="low_border">Low Border Edging (0.4m - 0.6m height)</option>
                  <option value="medium_privacy">Medium Privacy Hedge (1.0m - 1.5m height)</option>
                  <option value="tall_screen">Tall Acoustic / Windbreak Screen (2.0m - 3.0m height)</option>
                </select>
              </div>

              <div className="flex flex-col justify-center space-y-2 pt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={survey.shrubPreferences.hasFloweringBorders}
                    onChange={(e) =>
                      updateField('shrubPreferences', {
                        ...survey.shrubPreferences,
                        hasFloweringBorders: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-teal-600 rounded-sm focus:ring-teal-500"
                  />
                  <span>Client requests vibrant Flowering Shrubs</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={survey.shrubPreferences.hasFormalBoxwoodBedges}
                    onChange={(e) =>
                      updateField('shrubPreferences', {
                        ...survey.shrubPreferences,
                        hasFormalBoxwoodBedges: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-teal-600 rounded-sm focus:ring-teal-500"
                  />
                  <span>Formal Boxwood / Buxus Evergreen Topiary</span>
                </label>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">Preferred Bush & Shrub Species</label>
                <span className="text-[11px] text-slate-500">
                  {survey.shrubPreferences.preferredSpecies.length} varieties selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  'Bougainvillea spectabilis',
                  'Buxus sempervirens (Boxwood)',
                  'Jasminum sambac (Arabian Jasmine)',
                  'Hibiscus rosa-sinensis',
                  'Tecoma stans (Yellow Bells)',
                  'Ixora coccinea',
                  'Plumbago auriculata',
                  'Carissa macrocarpa',
                  'Nerium oleander',
                  ...survey.shrubPreferences.preferredSpecies.filter(
                    (s) =>
                      ![
                        'Bougainvillea spectabilis',
                        'Buxus sempervirens (Boxwood)',
                        'Jasminum sambac (Arabian Jasmine)',
                        'Hibiscus rosa-sinensis',
                        'Tecoma stans (Yellow Bells)',
                        'Ixora coccinea',
                        'Plumbago auriculata',
                        'Carissa macrocarpa',
                        'Nerium oleander',
                      ].includes(s)
                  ),
                ].map((sp) => {
                  const isSelected = survey.shrubPreferences.preferredSpecies.includes(sp);
                  return (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => {
                        const newSpecies = isSelected
                          ? survey.shrubPreferences.preferredSpecies.filter((s) => s !== sp)
                          : [...survey.shrubPreferences.preferredSpecies, sp];
                        updateField('shrubPreferences', {
                          ...survey.shrubPreferences,
                          preferredSpecies: newSpecies,
                        });
                      }}
                      className={`text-xs px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-teal-600 text-white border-teal-600 font-medium'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {sp}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Trees & Palms Section */}
          <div className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trees className="w-4 h-4 text-amber-700" />
                <h3 className="text-sm font-bold text-slate-900">3. Specimen Trees, Palms & Fruit Trees</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPickerConfig({
                    title: 'Pick Specimen Trees & Palms from Plant Palette',
                    categoryFilter: 'trees_palms',
                    selectedSpecies: survey.treePreferences.preferredSpecies,
                    onSelect: (name) => {
                      if (!survey.treePreferences.preferredSpecies.includes(name)) {
                        updateField('treePreferences', {
                          ...survey.treePreferences,
                          preferredSpecies: [...survey.treePreferences.preferredSpecies, name],
                        });
                      }
                    },
                    onRemove: (name) => {
                      updateField('treePreferences', {
                        ...survey.treePreferences,
                        preferredSpecies: survey.treePreferences.preferredSpecies.filter((s) => s !== name),
                      });
                    },
                  });
                  setIsPickerOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-amber-700" />
                <span>Browse Trees & Palms ({survey.treePreferences.preferredSpecies.length} Selected)</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shade Trees (Nos)</label>
                <input
                  type="number"
                  min="0"
                  value={survey.treePreferences.shadeTreeCount}
                  onChange={(e) =>
                    updateField('treePreferences', {
                      ...survey.treePreferences,
                      shadeTreeCount: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-mono bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Palms (Date / Fan) (Nos)</label>
                <input
                  type="number"
                  min="0"
                  value={survey.treePreferences.palmTreeCount}
                  onChange={(e) =>
                    updateField('treePreferences', {
                      ...survey.treePreferences,
                      palmTreeCount: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-mono bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fruit Trees (Nos)</label>
                <input
                  type="number"
                  min="0"
                  value={survey.treePreferences.fruitTreeCount}
                  onChange={(e) =>
                    updateField('treePreferences', {
                      ...survey.treePreferences,
                      fruitTreeCount: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-mono bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ornamental Trees (Nos)</label>
                <input
                  type="number"
                  min="0"
                  value={survey.treePreferences.ornamentalTreeCount}
                  onChange={(e) =>
                    updateField('treePreferences', {
                      ...survey.treePreferences,
                      ornamentalTreeCount: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-mono bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">Selected Tree Species</label>
                <span className="text-[11px] text-slate-500">
                  {survey.treePreferences.preferredSpecies.length} varieties
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  'Phoenix dactylifera (Date Palm)',
                  'Delonix regia (Poinciana)',
                  'Olea europaea (Olive Tree)',
                  'Plumeria rubra (Frangipani)',
                  'Washingtonia robusta',
                  'Azadirachta indica (Neem)',
                  ...survey.treePreferences.preferredSpecies.filter(
                    (s) =>
                      ![
                        'Phoenix dactylifera (Date Palm)',
                        'Delonix regia (Poinciana)',
                        'Olea europaea (Olive Tree)',
                        'Plumeria rubra (Frangipani)',
                        'Washingtonia robusta',
                        'Azadirachta indica (Neem)',
                      ].includes(s)
                  ),
                ].map((sp) => {
                  const isSelected = survey.treePreferences.preferredSpecies.includes(sp);
                  return (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => {
                        const newSpecies = isSelected
                          ? survey.treePreferences.preferredSpecies.filter((s) => s !== sp)
                          : [...survey.treePreferences.preferredSpecies, sp];
                        updateField('treePreferences', {
                          ...survey.treePreferences,
                          preferredSpecies: newSpecies,
                        });
                      }}
                      className={`text-xs px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-amber-700 text-white border-amber-700 font-medium'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {sp}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-1">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={survey.treePreferences.useTreeStakes}
                  onChange={(e) =>
                    updateField('treePreferences', {
                      ...survey.treePreferences,
                      useTreeStakes: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-amber-600 rounded-sm focus:ring-amber-500"
                />
                <span>Include Double Timber Lodge Stakes & Hessian Straps</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={survey.treePreferences.useMulchRings}
                  onChange={(e) =>
                    updateField('treePreferences', {
                      ...survey.treePreferences,
                      useMulchRings: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-amber-600 rounded-sm focus:ring-amber-500"
                />
                <span>Include Circular Earth Basins with Mulch Infill</span>
              </label>
            </div>
          </div>

          {/* Ground Covers & Mulch Section */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sprout className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">4. Ground Covers, Perennials & Mulching</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPickerConfig({
                    title: 'Pick Groundcovers, Succulents & Mulches from Palette',
                    categoryFilter: 'groundcover_mulch',
                    selectedSpecies: survey.groundCoverPreferences.preferredSpecies,
                    onSelect: (name) => {
                      if (!survey.groundCoverPreferences.preferredSpecies.includes(name)) {
                        updateField('groundCoverPreferences', {
                          ...survey.groundCoverPreferences,
                          preferredSpecies: [...survey.groundCoverPreferences.preferredSpecies, name],
                        });
                      }
                    },
                    onRemove: (name) => {
                      updateField('groundCoverPreferences', {
                        ...survey.groundCoverPreferences,
                        preferredSpecies: survey.groundCoverPreferences.preferredSpecies.filter((s) => s !== name),
                      });
                    },
                  });
                  setIsPickerOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-slate-700" />
                <span>Browse Groundcovers from Palette</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ground Cover Planting Area</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    value={survey.groundCoverPreferences.areaM2}
                    onChange={(e) =>
                      updateField('groundCoverPreferences', {
                        ...survey.groundCoverPreferences,
                        areaM2: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono bg-white"
                  />
                  <span className="text-xs text-slate-500 font-semibold">m²</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Surface Mulch Finish</label>
                <select
                  value={survey.groundCoverPreferences.mulchType}
                  onChange={(e) =>
                    updateField('groundCoverPreferences', {
                      ...survey.groundCoverPreferences,
                      mulchType: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                >
                  <option value="pine_bark">Natural Graded Shredded Pine Bark (50mm)</option>
                  <option value="volcanic_lava">Black Volcanic Porous Lava Stone (20-30mm)</option>
                  <option value="river_pebbles">White Polished River Pebbles (Luxury Zen)</option>
                  <option value="none">No Mulch (Bare Groundcover Spreading)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mulch Layer Depth (cm)</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="3"
                    max="15"
                    value={survey.groundCoverPreferences.mulchDepthCm}
                    onChange={(e) =>
                      updateField('groundCoverPreferences', {
                        ...survey.groundCoverPreferences,
                        mulchDepthCm: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono bg-white"
                  />
                  <span className="text-xs text-slate-500 font-semibold">cm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: HARDSCAPE & OUTDOOR LIVING */}
      {activeSubTab === 'hardscape' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Hardscaping, Paving & Outdoor Living Amenities</h2>
              <p className="text-xs text-slate-500">
                Specify patio paving, cantilever umbrellas, garden sofa sets, park benches, and decorative gravel with regional market benchmarks (greensouq.ae).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setPickerConfig({
                    title: 'Pick Hardscape Materials from Palette',
                    categoryFilter: 'hardscape_materials',
                    selectedSpecies: [],
                    onSelect: () => {},
                  });
                  setIsPickerOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors cursor-pointer"
              >
                <Grid className="w-3.5 h-3.5 text-amber-700" />
                <span>Browse Paving & Gravel</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPickerConfig({
                    title: 'Pick Outdoor Furniture & Shading from Palette',
                    categoryFilter: 'furniture_amenities',
                    selectedSpecies: [],
                    onSelect: () => {},
                  });
                  setIsPickerOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-900 text-xs font-bold transition-colors cursor-pointer"
              >
                <Armchair className="w-3.5 h-3.5 text-blue-700" />
                <span>Browse Furniture & Umbrellas</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAddModalCategory('cantilever_umbrella');
                  setIsAddModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Item</span>
              </button>
            </div>
          </div>

          {/* Hardscape Surface Area Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-amber-200/80 bg-amber-50/20">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Measured Hardscape Paving Footprint</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  value={survey.hardscapeAreaM2}
                  onChange={(e) => updateField('hardscapeAreaM2', Number(e.target.value))}
                  className="w-full text-base font-bold text-slate-900 bg-white border border-slate-300 rounded-md px-2 py-1 font-mono"
                />
                <span className="text-xs text-slate-500 font-semibold">m²</span>
              </div>
            </div>

            <div className="sm:col-span-2 flex flex-col justify-center">
              <span className="text-xs font-semibold text-slate-700">Hardscape Ratio:</span>
              <p className="text-xs text-slate-600">
                Paving covers {((survey.hardscapeAreaM2 / (survey.totalLandscapeAreaM2 || 1)) * 100).toFixed(0)}% of total landscape area.
                Typical residential guidelines recommend 15% - 25% hardscape footprint for pathways, dining patios, and barbecue terraces.
              </p>
            </div>
          </div>

          {/* Popular Hardscape & Outdoor Living Item Cards (1-click addition to BOQ) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Popular Hardscape & Outdoor Living Amenities (greensouq.ae benchmarks)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {[
                {
                  id: 'porcelain-60',
                  name: 'Outdoor Porcelain Pavers (60x60x2cm)',
                  spec: 'R11 Anti-Slip, frost & stain proof Italian vitrified porcelain',
                  unit: 'm2',
                  rateUSD: 34,
                  category: 'Paving',
                  section: 'D_HARDSCAPE' as const,
                },
                {
                  id: 'travertine-30',
                  name: 'French Pattern Tumbled Travertine Pavers',
                  spec: '30mm thickness, cool under bare feet in high summer sun',
                  unit: 'm2',
                  rateUSD: 46,
                  category: 'Paving',
                  section: 'D_HARDSCAPE' as const,
                },
                {
                  id: 'umbrella-3x3',
                  name: '3m x 3m Rotating Cantilever Umbrella',
                  spec: '360° foot pedal rotation, Sunbrella UV50+ fabric, 120kg granite base',
                  unit: 'Nos',
                  rateUSD: 520,
                  category: 'Shading',
                  section: 'D_HARDSCAPE' as const,
                },
                {
                  id: 'umbrella-4x4-led',
                  name: '4m x 4m Cantilever Umbrella with Solar LED',
                  spec: 'Wind-resistant heavy frame with solar rib LED ambient evening lighting',
                  unit: 'Nos',
                  rateUSD: 820,
                  category: 'Shading',
                  section: 'D_HARDSCAPE' as const,
                },
                {
                  id: 'sofa-5seater',
                  name: 'Luxury 5-Seater UV Rattan Corner Sofa Set',
                  spec: 'Weatherproof HDPE resin wicker, aluminum subframe, Olefin cushions',
                  unit: 'Set',
                  rateUSD: 1250,
                  category: 'Furniture',
                  section: 'D_HARDSCAPE' as const,
                },
                {
                  id: 'bench-teak',
                  name: 'Solid Teak & Cast Aluminum Park Bench (1.8m)',
                  spec: 'Grade-A contoured teak slats, marine varnish, dark anthracite legs',
                  unit: 'Nos',
                  rateUSD: 220,
                  category: 'Furniture',
                  section: 'D_HARDSCAPE' as const,
                },
                {
                  id: 'pergola-4x3',
                  name: 'Bioclimatic Louvered Motorized Pergola (4x3m)',
                  spec: 'Remote controlled 0-135° rotating roof louvers, perimeter LED strip',
                  unit: 'Set',
                  rateUSD: 2850,
                  category: 'Pergola',
                  section: 'D_HARDSCAPE' as const,
                },
                {
                  id: 'fire-pit-gas',
                  name: 'Architectural Concrete Gas Fire Pit Table',
                  spec: '50,000 BTU stainless burner, volcanic lava bedding, glass guard',
                  unit: 'Nos',
                  rateUSD: 640,
                  category: 'Fire Pit',
                  section: 'D_HARDSCAPE' as const,
                },
                {
                  id: 'pebbles-thassos',
                  name: 'Pure White Thassos Marble River Pebbles',
                  spec: 'Snow-white tumbled 30-50mm stones laid over geotextile membrane',
                  unit: 'm2',
                  rateUSD: 15,
                  category: 'Gravel & Stone',
                  section: 'D_HARDSCAPE' as const,
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200 p-3.5 flex flex-col justify-between hover:border-amber-300 transition-all space-y-2.5 shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {formatCurrencyValue(item.rateUSD, currency)} / {item.unit}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{item.spec}</p>
                  </div>

                  {onAddBOQItem && (
                    <button
                      type="button"
                      onClick={() => {
                        onAddBOQItem({
                          section: item.section,
                          itemCode: `D-${Math.floor(10 + Math.random() * 89)}`,
                          category: item.category,
                          description: item.name,
                          specification: item.spec,
                          quantity: item.unit === 'm2' ? 30 : 1,
                          unit: item.unit as any,
                          unitRate: item.rateUSD,
                        });
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to BOQ</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: SOIL & SITE ENVIRONMENT (RAIN BIRD CH 2-3) */}
      {activeSubTab === 'environment' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">Soil, Topography & Climate Survey</h2>
            <p className="text-xs text-slate-500">
              Grounded in the Rain Bird Landscape Irrigation Design Manual (Chapters 2 & 3). Soil texture and slopes dictate sprinkler precipitation limits to prevent runoff.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Soil Texture & Squeeze Test */}
            <div className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/20 space-y-3">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                Rain Bird Soil Characterization
              </span>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Field Soil Texture</label>
                <select
                  value={survey.soilTexture}
                  onChange={(e) => {
                    const texture = e.target.value as SoilTextureType;
                    const newRate =
                      texture === 'coarse_sandy'
                        ? 51
                        : texture === 'light_sandy_loam'
                        ? 32
                        : texture === 'uniform_silt_loam'
                        ? 20
                        : 5;
                    updateField('soilTexture', texture);
                    updateField('soilInfiltrationRateMmH', newRate);
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
                >
                  <option value="coarse_sandy">Coarse Sandy Soil (Particles loose, crumbles easily)</option>
                  <option value="coarse_sandy_compact">Coarse Sand over Compact Subsoil</option>
                  <option value="light_sandy_loam">Light Sandy Loam (Uniform texture, balanced)</option>
                  <option value="light_sandy_compact">Light Sandy Loam over Compact Subsoil</option>
                  <option value="uniform_silt_loam">Uniform Silt Loam (Fine sand, low clay)</option>
                  <option value="silt_loam_compact">Silt Loam over Compact Subsoil</option>
                  <option value="heavy_clay">Heavy Clay / Clay Loam (Forms flexible ribbon)</option>
                </select>
              </div>

              {/* Squeeze test guide box */}
              <div className="p-3 bg-white rounded-lg border border-amber-200 text-xs text-slate-700 space-y-1">
                <div className="font-semibold text-amber-950 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-700" />
                  <span>Rain Bird Field Squeeze Test:</span>
                </div>
                <p className="text-slate-600">{soilInfo.description}</p>
                <div className="pt-1 flex items-center gap-4 text-xs font-mono font-medium text-slate-700">
                  <span>Available Water (AW): {soilInfo.awMmPerM} mm/m</span>
                  <span>Intake Rate: {survey.soilInfiltrationRateMmH} mm/h</span>
                </div>
              </div>
            </div>

            {/* Slope & Runoff Limits */}
            <div className="p-4 rounded-xl border border-blue-200/80 bg-blue-50/20 space-y-3">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block">
                Topography & Maximum Precipitation Rate
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Slope Category</label>
                  <select
                    value={survey.slopeCategory}
                    onChange={(e) => {
                      const cat = e.target.value as SlopeCategory;
                      const pct = cat === 'flat_0_5' ? 2 : cat === 'gentle_5_8' ? 6 : cat === 'moderate_8_12' ? 10 : 15;
                      updateField('slopeCategory', cat);
                      updateField('slopePercent', pct);
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                  >
                    <option value="flat_0_5">0% to 5% Slope (Flat to slight)</option>
                    <option value="gentle_5_8">5% to 8% Slope (Gentle slope)</option>
                    <option value="moderate_8_12">8% to 12% Slope (Moderate rolling)</option>
                    <option value="steep_12_plus">12%+ Slope (Steep embankment)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Measured Gradient (%)</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      max="45"
                      value={survey.slopePercent}
                      onChange={(e) => updateField('slopePercent', Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono bg-white"
                    />
                    <span className="text-xs text-slate-500 font-semibold">%</span>
                  </div>
                </div>
              </div>

              {/* Rain Bird USDA Slope Limit Card */}
              <div className="p-3 bg-white rounded-lg border border-blue-200 text-xs text-slate-700 space-y-1">
                <div className="font-semibold text-blue-950 flex items-center justify-between">
                  <span>USDA Maximum Permissible Precipitation Rate:</span>
                  <span className="font-mono text-blue-700 font-bold">{maxPR} mm/h</span>
                </div>
                <p className="text-slate-500 text-2xs">
                  Rain Bird Design Manual Fig 15: Exceeding {maxPR} mm/h on this soil and slope will trigger water runoff and topsoil erosion.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sunlight & Thermal Exposure</label>
              <select
                value={survey.sunExposure}
                onChange={(e) => updateField('sunExposure', e.target.value as SunExposure)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="full_sun">Full Sun (6+ hours direct radiation daily)</option>
                <option value="partial_shade">Partial Sun / Filtered Shade (3-5 hours)</option>
                <option value="deep_shade">Dense Shade (Under high building or tree canopy)</option>
                <option value="mixed">Microclimate Mixed (Shaded north, blazing south)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Wind Conditions (Drift Risk)</label>
              <select
                value={survey.windCondition}
                onChange={(e) => updateField('windCondition', e.target.value as WindCondition)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="calm_0_5">Calm / Low Wind (0 to 5 km/h / 0-3 mph) - 55-60% spacing</option>
                <option value="moderate_6_11">Moderate Wind (6 to 11 km/h / 4-7 mph) - 50% head-to-head</option>
                <option value="high_12_plus">High Wind (12+ km/h / 8-12 mph) - 45% tight spacing</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Prevailing Wind Direction</label>
              <input
                type="text"
                value={survey.prevailingWindDirection}
                onChange={(e) => updateField('prevailingWindDirection', e.target.value)}
                placeholder="e.g. North-West (NW)"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subsoil Replacement Depth (cm)</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="10"
                  max="60"
                  value={survey.soilReplacementDepthCm}
                  onChange={(e) => updateField('soilReplacementDepthCm', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                />
                <span className="text-xs text-slate-500 font-semibold">cm</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Compost & Organic Enrichment (%)</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={survey.organicCompostMixPercent}
                  onChange={(e) => updateField('organicCompostMixPercent', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                />
                <span className="text-xs text-slate-500 font-semibold">%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Natural Site Drainage</label>
              <select
                value={survey.drainageCondition}
                onChange={(e) => updateField('drainageCondition', e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="good">Good Drainage (No standing water after rain)</option>
                <option value="moderate">Moderate Drainage (Drains within 4 hours)</option>
                <option value="poor_ponding">Poor Drainage (Severe water ponding risk)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: RAIN BIRD WATER SUPPLY & HYDRAULICS */}
      {activeSubTab === 'water' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">Water Supply & Hydraulic Capacity Survey</h2>
            <p className="text-xs text-slate-500">
              Rain Bird Manual Chapter 4: Calculating water meter capacity, static pressure at POC, and service line velocity limits (5 to 7.5 ft/s).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Water Source Origin</label>
              <select
                value={survey.waterSource}
                onChange={(e) => updateField('waterSource', e.target.value as WaterSourceType)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="municipal_main">City Potable Water Main</option>
                <option value="deep_well">Private Deep Well / Borehole</option>
                <option value="storage_tank_pump">Dedicated Irrigation Storage Tank + Booster Pump</option>
                <option value="tse_recycled">Treated Sewage Effluent (TSE) Recycled Line</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Static Water Pressure at POC (bar)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="12.0"
                  value={survey.staticPressureBar}
                  onChange={(e) => updateField('staticPressureBar', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                />
                <span className="text-xs text-slate-500 font-semibold">bar</span>
              </div>
              <span className="text-2xs text-slate-400 mt-1 block">
                ≈ {(survey.staticPressureBar * 14.5038).toFixed(1)} psi
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Water Meter Nominal Size</label>
              <select
                value={survey.waterMeterSizeInch}
                onChange={(e) => updateField('waterMeterSizeInch', e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
              >
                <option value="5/8">5/8" Meter (Max safe 4.5 m³/h)</option>
                <option value="3/4">3/4" Meter (Max safe 6.8 m³/h)</option>
                <option value="1">1" Meter (Max safe 11.4 m³/h)</option>
                <option value="1_1/2">1-1/2" Meter (Max safe 22.7 m³/h)</option>
                <option value="2">2" Commercial Meter (Max safe 36.3 m³/h)</option>
                <option value="3">3" High-Flow Meter (Max safe 72.7 m³/h)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Service Line Diameter</label>
              <select
                value={survey.serviceLineSizeMm}
                onChange={(e) => updateField('serviceLineSizeMm', Number(e.target.value) as any)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
              >
                <option value={20}>20 mm (3/4")</option>
                <option value={25}>25 mm (1")</option>
                <option value={32}>32 mm (1-1/4")</option>
                <option value={40}>40 mm (1-1/2")</option>
                <option value={50}>50 mm (2")</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Service Line Material</label>
              <select
                value={survey.serviceLineMaterial}
                onChange={(e) => updateField('serviceLineMaterial', e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="copper_k">Type K Copper Pipe</option>
                <option value="pvc_sch40">PVC Schedule 40 IPS</option>
                <option value="pe_sdr">Polyethylene PE100 SDR</option>
                <option value="gi_steel">Galvanized Steel Pipe</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Service Line Length (Meters)</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={survey.serviceLineLengthM}
                  onChange={(e) => updateField('serviceLineLengthM', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                />
                <span className="text-xs text-slate-500 font-semibold">m</span>
              </div>
            </div>
          </div>

          {/* Rain Bird 3-Rule Flow Calculation Output Box */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                Rain Bird 3 Safe Water Flow Rules (Page 27-29)
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-600 text-white">
                Governing Flow: {waterCap.governingFlowM3h} m³/h ({(waterCap.governingFlowM3h * 4.403).toFixed(1)} GPM)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-blue-100">
                <span className="block text-slate-500 font-medium">Rule 1 (10% Static Loss)</span>
                <span className="text-sm font-bold font-mono text-slate-900">{waterCap.rule1FlowM3h} m³/h</span>
                <span className="text-2xs text-slate-400 block">{(waterCap.rule1FlowM3h * 4.403).toFixed(1)} GPM</span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-blue-100">
                <span className="block text-slate-500 font-medium">Rule 2 (75% Meter Rating)</span>
                <span className="text-sm font-bold font-mono text-slate-900">{waterCap.rule2FlowM3h} m³/h</span>
                <span className="text-2xs text-slate-400 block">{(waterCap.rule2FlowM3h * 4.403).toFixed(1)} GPM</span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-blue-100">
                <span className="block text-slate-500 font-medium">Rule 3 (Pipe Velocity ≤ 2.0 m/s)</span>
                <span className="text-sm font-bold font-mono text-slate-900">{waterCap.rule3FlowM3h} m³/h</span>
                <span className="text-2xs text-slate-400 block">{(waterCap.rule3FlowM3h * 4.403).toFixed(1)} GPM</span>
              </div>
            </div>

            <p className="text-xs text-blue-900 font-medium flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0 text-blue-600" />
              <span>Design Principle: {waterCap.governingRule} sets the maximum simultaneous valve circuit flow.</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Elevation Change (Meters)</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  value={survey.elevationChangeM}
                  onChange={(e) => updateField('elevationChangeM', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                />
                <span className="text-xs text-slate-500 font-semibold">m</span>
              </div>
              <span className="text-2xs text-slate-400 mt-1 block">+ uphill (loss), - downhill (gain)</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Water Window (Hours/Night)</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="2"
                  max="14"
                  value={survey.waterWindowHoursPerDay}
                  onChange={(e) => updateField('waterWindowHoursPerDay', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                />
                <span className="text-xs text-slate-500 font-semibold">hrs</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Watering Days Per Week</label>
              <select
                value={survey.wateringDaysPerWeek}
                onChange={(e) => updateField('wateringDaysPerWeek', Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
              >
                <option value={3}>3 Days / Week (Alternate)</option>
                <option value={4}>4 Days / Week</option>
                <option value={5}>5 Days / Week</option>
                <option value={6}>6 Days / Week</option>
                <option value={7}>7 Days / Week (Daily Midsummer)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Controller Power Source</label>
              <select
                value={survey.powerVoltage}
                onChange={(e) => updateField('powerVoltage', e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
              >
                <option value="230V_50Hz">230V AC / 50Hz (International Standard)</option>
                <option value="120V_60Hz">120V AC / 60Hz (US Standard)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Controller Location / DB Panel</label>
              <input
                type="text"
                value={survey.powerLocation}
                onChange={(e) => updateField('powerLocation', e.target.value)}
                placeholder="e.g. Inside Garage, West wall near DB"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: CLIENT NOTES & CONSTRAINTS */}
      {activeSubTab === 'notes' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">Client Preferences & Site Constraints</h2>
            <p className="text-xs text-slate-500">Record special architectural nuances, access constraints, and client comments.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Client Specific Preferences (Aromas, Pet Safety, Children, Color Themes)
              </label>
              <textarea
                rows={4}
                value={survey.clientSpecialNotes}
                onChange={(e) => updateField('clientSpecialNotes', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                placeholder="Note down requested flowering species, low-allergen plants, view sightlines from dining room windows..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Site Access, Buried Utilities & Physical Boundaries
              </label>
              <textarea
                rows={3}
                value={survey.siteAccessConstraints}
                onChange={(e) => updateField('siteAccessConstraints', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                placeholder="Width of garden side gate, location of underground electric cables, existing trees to preserve..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Interactive Plant & Material Picker Modal */}
      <PlantPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        title={pickerConfig.title}
        categoryFilter={pickerConfig.categoryFilter}
        selectedSpecies={pickerConfig.selectedSpecies}
        onSelectSpecies={pickerConfig.onSelect}
        onRemoveSpecies={pickerConfig.onRemove}
        currency={currency}
        onAddBOQItem={onAddBOQItem}
        customItems={customItems}
      />

      {/* Add Custom Item Modal */}
      <AddCustomItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        currency={currency}
        defaultCategory={addModalCategory}
        onSaveItem={(newItem, addToBOQ, qty) => {
          if (onAddCustomItem) {
            onAddCustomItem(newItem, addToBOQ, qty);
          }
        }}
      />
    </div>
  );
};
