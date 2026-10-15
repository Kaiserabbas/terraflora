import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Header } from './components/Header.tsx';
import { SurveyForm } from './components/SurveyForm.tsx';
import { BOQSheet } from './components/BOQSheet.tsx';
import { HydraulicSchedule } from './components/HydraulicSchedule.tsx';
import { PlantPaletteView } from './components/PlantPaletteView.tsx';
import { ProposalPreview } from './components/ProposalPreview.tsx';
import { AIAdvisorModal } from './components/AIAdvisorModal.tsx';
import { AddCustomItemModal } from './components/AddCustomItemModal.tsx';
import {
  DEFAULT_SITE_SURVEY,
  generateBOQFromSurvey,
  generateHydraulicZones,
  calculateBOQTotals,
} from './utils/calculations.ts';
import { exportProjectToExcel, exportBOQToCSV } from './utils/excelExporter.ts';
import { exportProjectToPDF } from './utils/pdfExporter.ts';
import {
  fetchLiveExchangeRates,
  DEFAULT_EXCHANGE_RATES,
  CurrencyCode,
} from './utils/currencyService.ts';
import type {
  BOQItem,
  BOQSectionId,
  BOQSummary,
  Currency,
  SiteSurveyData,
} from './types/landscape.ts';
import type { CatalogItem } from './data/plantCatalog.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<'survey' | 'boq' | 'hydraulics' | 'plants' | 'preview'>('survey');
  const [survey, setSurvey] = useState<SiteSurveyData>(DEFAULT_SITE_SURVEY);
  const [currency, setCurrency] = useState<Currency>('AED'); // Default to AED (UAE regional)
  const [exchangeRates, setExchangeRates] = useState<Record<CurrencyCode, number>>(DEFAULT_EXCHANGE_RATES);
  const [rateSource, setRateSource] = useState<string>('Standard Market Reference');
  const [isRatesLoading, setIsRatesLoading] = useState<boolean>(false);
  const prevCurrencyRef = useRef<Currency>('USD');

  // Modals state
  const [isAIAdvisorOpen, setIsAIAdvisorOpen] = useState<boolean>(false);
  const [isAddCustomOpen, setIsAddCustomOpen] = useState<boolean>(false);
  const [customCatalogItems, setCustomCatalogItems] = useState<CatalogItem[]>([]);
  const [isPdfGenerating, setIsPdfGenerating] = useState<boolean>(false);

  // Baseline items generated in USD converted to AED
  const [boqItems, setBoqItems] = useState<BOQItem[]>(() => {
    const raw = generateBOQFromSurvey(DEFAULT_SITE_SURVEY);
    const aedRate = DEFAULT_EXCHANGE_RATES.AED || 3.6725;
    return raw.map((item) => ({
      ...item,
      unitRate: Number((item.unitRate * aedRate).toFixed(2)),
      amount: Number((item.quantity * item.unitRate * aedRate).toFixed(2)),
    }));
  });

  // Pricing controls
  const [overheadProfitPercent, setOverheadProfitPercent] = useState<number>(15);
  const [contingencyPercent, setContingencyPercent] = useState<number>(5);
  const [taxPercent, setTaxPercent] = useState<number>(5);

  // Fetch real-time exchange rates on mount
  const loadRates = async () => {
    setIsRatesLoading(true);
    try {
      const res = await fetchLiveExchangeRates();
      setExchangeRates(res.rates);
      setRateSource(res.source);
    } catch {
      // Keep robust defaults
    } finally {
      setIsRatesLoading(false);
    }
  };

  useEffect(() => {
    loadRates();
    prevCurrencyRef.current = 'AED';
  }, []);

  // Handle currency conversion across items
  const handleCurrencyChange = (newCurrency: Currency) => {
    const oldCurr = prevCurrencyRef.current;
    if (oldCurr === newCurrency) return;

    const oldRateToUSD = exchangeRates[oldCurr as CurrencyCode] || 1.0;
    const newRateToUSD = exchangeRates[newCurrency as CurrencyCode] || 1.0;
    const conversionFactor = newRateToUSD / oldRateToUSD;

    const convertedItems = boqItems.map((item) => {
      const newRate = Number((item.unitRate * conversionFactor).toFixed(2));
      return {
        ...item,
        unitRate: newRate,
        amount: Number((item.quantity * newRate).toFixed(2)),
      };
    });

    setBoqItems(convertedItems);
    setCurrency(newCurrency);
    setSurvey((prev) => ({ ...prev, currency: newCurrency }));
    prevCurrencyRef.current = newCurrency;
  };

  // Derived calculations
  const zones = useMemo(() => generateHydraulicZones(survey), [survey]);

  const boqSummary: BOQSummary = useMemo(() => {
    return calculateBOQTotals(boqItems, overheadProfitPercent, contingencyPercent, taxPercent);
  }, [boqItems, overheadProfitPercent, contingencyPercent, taxPercent]);

  // Sync BOQ from Survey
  const handleGenerateBOQ = () => {
    const baseItems = generateBOQFromSurvey(survey);
    const currRate = exchangeRates[currency as CurrencyCode] || 1.0;
    const converted = baseItems.map((item) => ({
      ...item,
      unitRate: Number((item.unitRate * currRate).toFixed(2)),
      amount: Number((item.quantity * item.unitRate * currRate).toFixed(2)),
    }));
    setBoqItems(converted);
  };

  // Preset templates
  const handleLoadPreset = (preset: 'villa' | 'xeriscape' | 'commercial') => {
    const currRate = exchangeRates[currency as CurrencyCode] || 1.0;

    if (preset === 'villa') {
      const villaSurvey: SiteSurveyData = { ...DEFAULT_SITE_SURVEY, currency };
      setSurvey(villaSurvey);
      const items = generateBOQFromSurvey(villaSurvey).map((i) => ({
        ...i,
        unitRate: Number((i.unitRate * currRate).toFixed(2)),
        amount: Number((i.quantity * i.unitRate * currRate).toFixed(2)),
      }));
      setBoqItems(items);
      return;
    }

    if (preset === 'xeriscape') {
      const xeriscapeSurvey: SiteSurveyData = {
        ...DEFAULT_SITE_SURVEY,
        projectName: 'Al-Mirage Modern Xeriscape Residence',
        projectNumber: 'KG-XS-2026-031',
        projectType: 'residential_villa',
        currency,
        totalLandscapeAreaM2: 260,
        turfAreaM2: 50,
        plantingBedsAreaM2: 150,
        hardscapeAreaM2: 60,
        turfPreference: {
          selectedType: 'Premium Landscape Artificial Turf 40mm',
          areaM2: 50,
          usageIntensity: 'ornamental_low',
          installationMethod: 'artificial',
        },
        shrubPreferences: {
          hedgeLengthLm: 30,
          hedgeHeightCategory: 'medium_privacy',
          hasFloweringBorders: true,
          hasFormalBoxwoodBedges: false,
          preferredSpecies: ['Bougainvillea spectabilis', 'Carissa macrocarpa', 'Plumbago auriculata'],
        },
        treePreferences: {
          shadeTreeCount: 1,
          palmTreeCount: 4,
          fruitTreeCount: 2,
          ornamentalTreeCount: 1,
          preferredSpecies: ['Phoenix dactylifera (Date Palm)', 'Olea europaea (Ancient Olive)', 'Plumeria rubra'],
          useTreeStakes: true,
          useMulchRings: true,
        },
        groundCoverPreferences: {
          areaM2: 80,
          mulchType: 'river_pebbles',
          mulchDepthCm: 7,
          preferredSpecies: ['Agave americana', 'Aloe vera', 'Sesuvium portulacastrum'],
        },
        waterMeterSizeInch: '1_1/2',
        serviceLineSizeMm: 32,
        staticPressureBar: 4.2,
        waterWindowHoursPerDay: 4,
        wateringDaysPerWeek: 4,
        clientSpecialNotes: 'Strict drought-tolerant xeriscape aesthetic with low-flow smart drip irrigation, natural stone desert mulch, and specimen date palms.',
      };
      setSurvey(xeriscapeSurvey);
      const items = generateBOQFromSurvey(xeriscapeSurvey).map((i) => ({
        ...i,
        unitRate: Number((i.unitRate * currRate).toFixed(2)),
        amount: Number((i.quantity * i.unitRate * currRate).toFixed(2)),
      }));
      setBoqItems(items);
      return;
    }

    if (preset === 'commercial') {
      const commercialSurvey: SiteSurveyData = {
        ...DEFAULT_SITE_SURVEY,
        projectName: 'Emaar Business Bay Waterfront Plaza',
        projectNumber: 'KG-CP-2026-088',
        projectType: 'commercial',
        currency,
        totalLandscapeAreaM2: 1200,
        turfAreaM2: 520,
        plantingBedsAreaM2: 380,
        hardscapeAreaM2: 300,
        turfPreference: {
          selectedType: 'Seashore Paspalum (Platinum TE)',
          areaM2: 520,
          usageIntensity: 'high_traffic',
          installationMethod: 'sod_rolls',
        },
        shrubPreferences: {
          hedgeLengthLm: 90,
          hedgeHeightCategory: 'tall_screen',
          hasFloweringBorders: true,
          hasFormalBoxwoodBedges: true,
          preferredSpecies: ['Buxus sempervirens', 'Tecoma stans', 'Ixora coccinea', 'Bougainvillea'],
        },
        treePreferences: {
          shadeTreeCount: 6,
          palmTreeCount: 8,
          fruitTreeCount: 0,
          ornamentalTreeCount: 4,
          preferredSpecies: ['Delonix regia', 'Washingtonia robusta', 'Azadirachta indica', 'Jacaranda mimosifolia'],
          useTreeStakes: true,
          useMulchRings: true,
        },
        groundCoverPreferences: {
          areaM2: 120,
          mulchType: 'pine_bark',
          mulchDepthCm: 5,
          preferredSpecies: ['Wedelia trilobata', 'Vinca major'],
        },
        waterMeterSizeInch: '2',
        serviceLineSizeMm: 40,
        staticPressureBar: 5.5,
        waterWindowHoursPerDay: 8,
        wateringDaysPerWeek: 6,
        clientSpecialNotes: 'High-visibility corporate campus landscape with expansive lawn for events and tall acoustic hedge screens.',
      };
      setSurvey(commercialSurvey);
      const items = generateBOQFromSurvey(commercialSurvey).map((i) => ({
        ...i,
        unitRate: Number((i.unitRate * currRate).toFixed(2)),
        amount: Number((i.quantity * i.unitRate * currRate).toFixed(2)),
      }));
      setBoqItems(items);
    }
  };

  const handleExportExcel = () => {
    exportProjectToExcel(survey, boqItems, boqSummary, zones);
  };

  const handleExportCSV = () => {
    exportBOQToCSV(survey, boqItems);
  };

  // Direct PDF generation using jspdf + jspdf-autotable (fixes "Save as pdf not working" issue)
  const handleExportPDF = async () => {
    setIsPdfGenerating(true);
    try {
      await exportProjectToPDF(survey, boqItems, boqSummary, zones);
    } catch (err) {
      console.error('Direct PDF export error, falling back to print preview:', err);
      window.print();
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddItemFromPalette = (newItem: Omit<BOQItem, 'id' | 'amount'>) => {
    const currRate = exchangeRates[currency as CurrencyCode] || 1.0;
    const rateInCurrency = Number((newItem.unitRate * currRate).toFixed(2));
    const item: BOQItem = {
      ...newItem,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      unitRate: rateInCurrency,
      amount: Number((newItem.quantity * rateInCurrency).toFixed(2)),
    };
    setBoqItems((prev) => [...prev, item]);
  };

  // Add custom items (plants, hardscape materials, outdoor furniture) to catalog and optionally to BOQ
  const handleAddCustomItem = (newItem: CatalogItem, addToBOQ = true, qty = 1) => {
    setCustomCatalogItems((prev) => [newItem, ...prev]);

    if (addToBOQ) {
      const sectionMap: Record<string, BOQSectionId> = {
        turf: 'B_SOFTSCAPE',
        shrub: 'B_SOFTSCAPE',
        tree: 'B_SOFTSCAPE',
        palm: 'B_SOFTSCAPE',
        groundcover: 'B_SOFTSCAPE',
        perennial: 'B_SOFTSCAPE',
        succulent: 'B_SOFTSCAPE',
        climber: 'B_SOFTSCAPE',
        herb: 'B_SOFTSCAPE',
        herb_vegetable: 'B_SOFTSCAPE',
        flower: 'B_SOFTSCAPE',
        indoor: 'B_SOFTSCAPE',
        balcony_pot: 'B_SOFTSCAPE',
        mulch: 'B_SOFTSCAPE',
        aquatic: 'B_SOFTSCAPE',
        paving: 'D_HARDSCAPE',
        artificial_grass: 'D_HARDSCAPE',
        gravel_stone: 'D_HARDSCAPE',
        blocks_retaining: 'D_HARDSCAPE',
        edging: 'D_HARDSCAPE',
        decking: 'D_HARDSCAPE',
        cantilever_umbrella: 'D_HARDSCAPE',
        garden_bench: 'D_HARDSCAPE',
        garden_sofa: 'D_HARDSCAPE',
        pergola: 'D_HARDSCAPE',
        water_fire_feature: 'D_HARDSCAPE',
        lighting: 'D_HARDSCAPE',
        irrigation: 'C_IRRIGATION',
        service: 'E_LABOR',
      };

      const section: BOQSectionId = sectionMap[newItem.category] || 'D_HARDSCAPE';
      const currRate = exchangeRates[currency as CurrencyCode] || 1.0;
      const usdRate = newItem.typicalRateUSD || 15;
      const unitRateInCurrency = Number((usdRate * currRate).toFixed(2));
      const boqUnit = (newItem.defaultUnit === 'Pot' ? 'Nos' : newItem.defaultUnit) as BOQItem['unit'];
      const sectionPrefix = section.split('_')[0];

      const boqItem: BOQItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        section,
        itemCode: `${sectionPrefix}-${String(boqItems.filter((i) => i.section === section).length + 1).padStart(2, '0')}`,
        category: newItem.category.replace(/_/g, ' ').toUpperCase(),
        description: `${newItem.commonName}${newItem.botanicalName ? ` (${newItem.botanicalName})` : ''}`,
        specification: newItem.specification || `${newItem.commonName} as per landscape specifications`,
        quantity: qty,
        unit: boqUnit,
        unitRate: unitRateInCurrency,
        amount: Number((qty * unitRateInCurrency).toFixed(2)),
        plantDetails: {
          botanicalName: newItem.botanicalName,
          commonName: newItem.commonName,
          waterRequirement: newItem.waterNeed,
          sunRequirement: newItem.sunNeed,
          spacingMeters: newItem.spacingM,
        },
      };

      setBoqItems((prev) => [...prev, boqItem]);
    }
  };

  const handleApplySurveyPlants = (plants: string[]) => {
    setSurvey((prev) => ({
      ...prev,
      shrubPreferences: {
        ...prev.shrubPreferences,
        preferredSpecies: Array.from(new Set([...prev.shrubPreferences.preferredSpecies, ...plants])),
      },
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Universal Top Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        exchangeRates={exchangeRates}
        rateSource={rateSource}
        isRatesLoading={isRatesLoading}
        onRefreshRates={loadRates}
        onExportExcel={handleExportExcel}
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
        onPrint={handlePrint}
        onOpenAIAdvisor={() => setIsAIAdvisorOpen(true)}
        onResetToSample={() => handleLoadPreset('villa')}
        onLoadPreset={handleLoadPreset}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'survey' && (
          <SurveyForm
            survey={survey}
            onChange={setSurvey}
            onGenerateBOQ={handleGenerateBOQ}
            onOpenAIAdvisor={() => setIsAIAdvisorOpen(true)}
            currency={currency}
            onAddBOQItem={handleAddItemFromPalette}
            customItems={customCatalogItems}
            onAddCustomItem={handleAddCustomItem}
          />
        )}

        {activeTab === 'boq' && (
          <BOQSheet
            items={boqItems}
            currency={currency}
            onUpdateItems={setBoqItems}
            onResetToCalculated={handleGenerateBOQ}
            onExportExcel={handleExportExcel}
            onExportPDF={handleExportPDF}
            onOpenAIAdvisor={() => setIsAIAdvisorOpen(true)}
            onOpenPlantPalette={() => setActiveTab('plants')}
            onOpenAddCustom={() => setIsAddCustomOpen(true)}
            overheadProfitPercent={overheadProfitPercent}
            setOverheadProfitPercent={setOverheadProfitPercent}
            contingencyPercent={contingencyPercent}
            setContingencyPercent={setContingencyPercent}
            taxPercent={taxPercent}
            setTaxPercent={setTaxPercent}
          />
        )}

        {activeTab === 'hydraulics' && (
          <HydraulicSchedule
            survey={survey}
            zones={zones}
            onExportExcel={handleExportExcel}
          />
        )}

        {activeTab === 'plants' && (
          <PlantPaletteView
            currency={currency}
            onAddItemToBOQ={handleAddItemFromPalette}
            customItems={customCatalogItems}
            onAddCustomItem={handleAddCustomItem}
          />
        )}

        {activeTab === 'preview' && (
          <ProposalPreview
            survey={survey}
            boqItems={boqItems}
            boqSummary={boqSummary}
            zones={zones}
            onPrint={handlePrint}
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
          />
        )}
      </main>

      {/* AI Architectural Advisor Modal */}
      <AIAdvisorModal
        isOpen={isAIAdvisorOpen}
        onClose={() => setIsAIAdvisorOpen(false)}
        survey={survey}
        boqItems={boqItems}
        currency={currency}
        onAddBOQItem={handleAddItemFromPalette}
        onApplySurveyPlants={handleApplySurveyPlants}
      />

      {/* Add Custom Item Modal (Plants, Hardscape, Umbrellas, Benches, Sofa Sets) */}
      <AddCustomItemModal
        isOpen={isAddCustomOpen}
        onClose={() => setIsAddCustomOpen(false)}
        currency={currency}
        onSaveItem={handleAddCustomItem}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 no-print">
        <p>
          TerraFlora Landscape & Irrigation Engine · Grounded in Rain Bird Landscape Irrigation Design Standards · 320+ Plant & Hardscape Database from UAE & Balcony Catalogs · Live Multi-Currency Conversion
        </p>
      </footer>
    </div>
  );
}
