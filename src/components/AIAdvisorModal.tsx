import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Trees,
  Sprout,
  Droplets,
  DollarSign,
  Plus,
  Check,
  Compass,
  Layers,
  ArrowRight,
  ShieldCheck,
  Armchair,
  Umbrella,
  FileCheck,
} from 'lucide-react';
import type { BOQItem, Currency, SiteSurveyData } from '../types/landscape.ts';
import { requestAIAdvisor, AIAdvisorResponse } from '../utils/aiAdvisorService.ts';
import { formatCurrencyValue } from '../utils/calculations.ts';

interface AIAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  survey: SiteSurveyData;
  boqItems: BOQItem[];
  currency: Currency;
  onAddBOQItem: (item: Omit<BOQItem, 'id' | 'amount'>) => void;
  onApplySurveyPlants?: (plants: string[]) => void;
}

export const AIAdvisorModal: React.FC<AIAdvisorModalProps> = ({
  isOpen,
  onClose,
  survey,
  boqItems,
  currency,
  onAddBOQItem,
  onApplySurveyPlants,
}) => {
  const [loading, setLoading] = useState(false);
  const [advisorData, setAdvisorData] = useState<AIAdvisorResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'concept' | 'plants' | 'outdoor' | 'hydraulics' | 'boq'>('concept');
  const [addedItemKeys, setAddedItemKeys] = useState<Record<string, boolean>>({});
  const [customPrompt, setCustomPrompt] = useState('');

  if (!isOpen) return null;

  const handleRunAnalysis = async (presetPrompt?: string) => {
    setLoading(true);
    try {
      const data = await requestAIAdvisor(survey, boqItems);
      setAdvisorData(data);
      setActiveTab('concept');
    } catch (err) {
      console.error('AI Analysis failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlantToBOQ = (plant: AIAdvisorResponse['recommendedPlants'][0], idx: number) => {
    const key = `plant-${idx}`;
    onAddBOQItem({
      section: 'B_SOFTSCAPE',
      itemCode: `B-AI${idx + 1}`,
      category: plant.category,
      description: `${plant.commonName} - ${plant.botanicalName}`,
      specification: plant.reason,
      quantity: plant.suggestedQty,
      unit: (plant.unit as any) || 'Nos',
      unitRate: plant.estRateUSD,
    });

    setAddedItemKeys((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setAddedItemKeys((prev) => ({ ...prev, [key]: false }));
    }, 2500);
  };

  const handleAddOutdoorToBOQ = (item: AIAdvisorResponse['outdoorLivingRecommendations'][0], idx: number) => {
    const key = `outdoor-${idx}`;
    onAddBOQItem({
      section: 'D_HARDSCAPE',
      itemCode: `D-AI${idx + 1}`,
      category: item.category,
      description: item.itemName,
      specification: item.placementReason,
      quantity: item.suggestedQty,
      unit: (item.unit as any) || 'Nos',
      unitRate: item.estRateUSD,
    });

    setAddedItemKeys((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setAddedItemKeys((prev) => ({ ...prev, [key]: false }));
    }, 2500);
  };

  const handleAddBOQAddition = (item: AIAdvisorResponse['boqAdditions'][0], idx: number) => {
    const key = `boq-${idx}`;
    onAddBOQItem({
      section: item.section,
      itemCode: `${item.section[0]}-AI${idx + 1}`,
      category: item.category,
      description: item.description,
      specification: item.specification,
      quantity: item.quantity,
      unit: item.unit,
      unitRate: item.unitRateUSD,
    });

    setAddedItemKeys((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setAddedItemKeys((prev) => ({ ...prev, [key]: false }));
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 text-white shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-inner">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">TerraFlora AI Landscape Architect & Estimator</h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Grounded in Rain Bird Irrigation Standards & UAE/Greensouq Nursery Pricing Benchmarks
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Chips & Prompt Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0 space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-slate-500 font-semibold shrink-0">Quick Queries:</span>
            <button
              type="button"
              onClick={() => handleRunAnalysis()}
              className="px-3 py-1.5 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-semibold shrink-0 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Full Site Design & Palette Synthesis</span>
            </button>
            <button
              type="button"
              onClick={() => handleRunAnalysis()}
              className="px-3 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold shrink-0 transition-colors flex items-center gap-1.5"
            >
              <Umbrella className="w-3.5 h-3.5 text-amber-600" />
              <span>Umbrellas, Sofas & Paving Amenities</span>
            </button>
            <button
              type="button"
              onClick={() => handleRunAnalysis()}
              className="px-3 py-1.5 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-900 font-semibold shrink-0 transition-colors flex items-center gap-1.5"
            >
              <Droplets className="w-3.5 h-3.5 text-blue-600" />
              <span>Rain Bird Hydraulic Audit</span>
            </button>
            <button
              type="button"
              onClick={() => handleRunAnalysis()}
              className="px-3 py-1.5 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-900 font-semibold shrink-0 transition-colors flex items-center gap-1.5"
            >
              <DollarSign className="w-3.5 h-3.5 text-purple-600" />
              <span>Value Engineering & Missing Items</span>
            </button>
          </div>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!advisorData && !loading && (
            <div className="text-center py-12 px-4 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-base font-bold text-slate-900">
                  Ready to Analyze "{survey.projectName || 'Site Survey'}"
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  The AI Architect will evaluate your site dimensions ({survey.totalLandscapeAreaM2} m²), soil texture ({survey.soilTexture}), slope ({survey.slopePercent}%), static pressure ({survey.staticPressureBar} bar), and formulate tailored plant selections, hardscape outdoor living packages, and Rain Bird hydraulic adjustments.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRunAnalysis()}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Professional AI Analysis</span>
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-16 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">Synthesizing Architectural Recommendations...</h4>
                <p className="text-xs text-slate-500 font-mono">
                  Calculating infiltration rates, nozzle spacing, and cross-checking greensouq.ae market benchmarks
                </p>
              </div>
            </div>
          )}

          {advisorData && !loading && (
            <div className="space-y-6">
              {/* Category Tab Bar */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('concept')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === 'concept'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Design Concept</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('plants')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === 'plants'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Sprout className="w-3.5 h-3.5" />
                  <span>Botanical Selections ({advisorData.recommendedPlants.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('outdoor')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === 'outdoor'
                      ? 'bg-amber-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Armchair className="w-3.5 h-3.5" />
                  <span>Outdoor Living & Hardscape ({advisorData.outdoorLivingRecommendations.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('hydraulics')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === 'hydraulics'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Droplets className="w-3.5 h-3.5" />
                  <span>Rain Bird Hydraulics</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('boq')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === 'boq'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>BOQ Additions ({advisorData.boqAdditions.length})</span>
                </button>
              </div>

              {/* TAB 1: DESIGN CONCEPT */}
              {activeTab === 'concept' && (
                <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/40 rounded-2xl border border-emerald-200 p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-emerald-800" />
                    <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wide">
                      Executive Architectural Landscape Concept
                    </h3>
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-line">
                    {advisorData.executiveConcept}
                  </p>
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('plants')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 transition-colors"
                    >
                      <span>Explore Recommended Plants</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('outdoor')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-800 text-white text-xs font-bold hover:bg-amber-900 transition-colors"
                    >
                      <span>Explore Outdoor Living & Hardscape</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: BOTANICAL SELECTIONS */}
              {activeTab === 'plants' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Arid-Adapted Botanical Recommendations</h3>
                      <p className="text-xs text-slate-500">
                        Selected specifically for soil {survey.soilTexture} and sunlight exposure {survey.sunExposure}.
                      </p>
                    </div>
                    {onApplySurveyPlants && (
                      <button
                        type="button"
                        onClick={() => {
                          const species = advisorData.recommendedPlants.map((p) => `${p.commonName} (${p.botanicalName})`);
                          onApplySurveyPlants(species);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition-colors"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Apply All to Survey Preferred Species</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {advisorData.recommendedPlants.map((plant, idx) => {
                      const isAdded = !!addedItemKeys[`plant-${idx}`];
                      return (
                        <div
                          key={idx}
                          className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 hover:border-emerald-300 transition-all shadow-2xs flex flex-col justify-between"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="text-sm font-bold text-slate-900">{plant.commonName}</h4>
                                <span className="text-xs font-mono italic text-emerald-700">{plant.botanicalName}</span>
                              </div>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                                {plant.category}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">{plant.reason}</p>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <div className="text-xs">
                              <span className="text-slate-500 font-medium">Qty: </span>
                              <span className="font-bold text-slate-900">{plant.suggestedQty} {plant.unit}</span>
                              <span className="mx-1.5 text-slate-300">·</span>
                              <span className="font-mono text-emerald-700 font-semibold">
                                {formatCurrencyValue(plant.estRateUSD, currency)} / {plant.unit}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAddPlantToBOQ(plant, idx)}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                isAdded
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                              }`}
                            >
                              {isAdded ? (
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
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: OUTDOOR LIVING & HARDSCAPE */}
              {activeTab === 'outdoor' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Outdoor Living & Hardscape Specifications</h3>
                    <p className="text-xs text-slate-500">
                      Cantilever umbrellas, park benches, garden sofa sets, and paving materials benchmarked against greensouq.ae.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {advisorData.outdoorLivingRecommendations.map((item, idx) => {
                      const isAdded = !!addedItemKeys[`outdoor-${idx}`];
                      return (
                        <div
                          key={idx}
                          className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 hover:border-amber-300 transition-all shadow-2xs flex flex-col justify-between"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{item.itemName}</h4>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                                {item.category}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">{item.placementReason}</p>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <div className="text-xs">
                              <span className="text-slate-500 font-medium">Qty: </span>
                              <span className="font-bold text-slate-900">{item.suggestedQty} {item.unit}</span>
                              <span className="mx-1.5 text-slate-300">·</span>
                              <span className="font-mono text-amber-800 font-bold">
                                {formatCurrencyValue(item.estRateUSD, currency)} / {item.unit}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAddOutdoorToBOQ(item, idx)}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                isAdded
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
                              }`}
                            >
                              {isAdded ? (
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
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: RAIN BIRD HYDRAULICS */}
              {activeTab === 'hydraulics' && (
                <div className="bg-blue-50/50 rounded-2xl border border-blue-200 p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-700" />
                    <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wide">
                      Rain Bird Certified Irrigation Design Advice
                    </h3>
                  </div>
                  <div className="bg-white rounded-xl border border-blue-100 p-4 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-line">
                    {advisorData.irrigationEngineeringAdvice}
                  </div>
                  <p className="text-xs text-blue-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Complies with Rain Bird Landscape Irrigation Design Manual (Steps 1 to 9).</span>
                  </p>
                </div>
              )}

              {/* TAB 5: BOQ ADDITIONS */}
              {activeTab === 'boq' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Value Engineering & Recommended BOQ Items</h3>
                    <p className="text-xs text-slate-500">
                      Additional components recommended to ensure installation durability and prevent scope gaps.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {advisorData.boqAdditions.map((item, idx) => {
                      const isAdded = !!addedItemKeys[`boq-${idx}`];
                      return (
                        <div
                          key={idx}
                          className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-purple-300 transition-all"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800">
                                {item.section.replace('_', ' ')}
                              </span>
                              <h4 className="text-sm font-bold text-slate-900">{item.description}</h4>
                            </div>
                            <p className="text-xs text-slate-600">{item.specification}</p>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                            <div className="text-right text-xs">
                              <div className="font-bold text-slate-900 font-mono">
                                {formatCurrencyValue(item.quantity * item.unitRateUSD, currency)}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {item.quantity} {item.unit} @ {formatCurrencyValue(item.unitRateUSD, currency)}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAddBOQAddition(item, idx)}
                              className={`flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                                isAdded
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-purple-50 text-purple-900 hover:bg-purple-100'
                              }`}
                            >
                              {isAdded ? (
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
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Clicking "Add to BOQ" synchronizes with the itemized spreadsheet in real-time.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
