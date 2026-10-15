import type {
  BOQItem,
  BOQSectionId,
  BOQSummary,
  Currency,
  IrrigationZoneCalc,
  SiteSurveyData,
  SlopeCategory,
  SoilTextureType,
} from '../types/landscape.ts';

// -------------------------------------------------------------
// Rain Bird Manual Hydraulic Formulas (Pages 3-123)
// -------------------------------------------------------------

/**
 * Calculates Sprinkler Precipitation Rate in mm/hr (Metric)
 * Formula: PR = (1000 * m3/h) / (S * L)
 * S = spacing between sprinklers (m)
 * L = spacing between rows of sprinklers (m)
 */
export function calculatePrecipitationRateMetric(
  flowM3h: number,
  spacingS: number,
  spacingL: number
): number {
  if (spacingS <= 0 || spacingL <= 0 || flowM3h <= 0) return 0;
  return Number(((1000 * flowM3h) / (spacingS * spacingL)).toFixed(2));
}

/**
 * Calculates Sprinkler Precipitation Rate in inches/hr (US Standard)
 * Formula: PR = (96.3 * gpm) / (S * L)
 */
export function calculatePrecipitationRateUS(
  flowGpm: number,
  spacingSFeet: number,
  spacingLFeet: number
): number {
  if (spacingSFeet <= 0 || spacingLFeet <= 0 || flowGpm <= 0) return 0;
  return Number(((96.3 * flowGpm) / (spacingSFeet * spacingLFeet)).toFixed(3));
}

/**
 * Calculates Operating Time in minutes per day (Rain Bird Manual Ch 6, p. 58-59, 123)
 * Formula: OT = (I * 60) / (PR * DA)
 * I = weekly irrigation requirement (mm/week)
 * PR = precipitation rate (mm/h)
 * DA = days available for irrigation per week
 */
export function calculateOperatingTimeMinutes(
  weeklyRequirementMm: number,
  precipitationRateMmH: number,
  daysAvailablePerWeek: number
): number {
  if (precipitationRateMmH <= 0 || daysAvailablePerWeek <= 0 || weeklyRequirementMm <= 0) return 0;
  const time = (weeklyRequirementMm * 60) / (precipitationRateMmH * daysAvailablePerWeek);
  return Math.round(time);
}

/**
 * Maximum Recommended Precipitation Rate for Soils & Slopes (Rain Bird Manual Page 21 & 118)
 * Returns max recommended application rate in mm/h before runoff occurs.
 */
export function getMaxPrecipitationRate(
  soil: SoilTextureType,
  slope: SlopeCategory,
  hasVegetativeCover: boolean = true
): number {
  const table: Record<SoilTextureType, Record<SlopeCategory, { cover: number; bare: number }>> = {
    coarse_sandy: {
      flat_0_5: { cover: 51, bare: 51 },
      gentle_5_8: { cover: 51, bare: 38 },
      moderate_8_12: { cover: 38, bare: 25 },
      steep_12_plus: { cover: 25, bare: 13 },
    },
    coarse_sandy_compact: {
      flat_0_5: { cover: 44, bare: 38 },
      gentle_5_8: { cover: 32, bare: 25 },
      moderate_8_12: { cover: 25, bare: 19 },
      steep_12_plus: { cover: 19, bare: 10 },
    },
    light_sandy_loam: {
      flat_0_5: { cover: 44, bare: 25 },
      gentle_5_8: { cover: 32, bare: 20 },
      moderate_8_12: { cover: 25, bare: 15 },
      steep_12_plus: { cover: 19, bare: 10 },
    },
    light_sandy_compact: {
      flat_0_5: { cover: 32, bare: 19 },
      gentle_5_8: { cover: 25, bare: 13 },
      moderate_8_12: { cover: 19, bare: 10 },
      steep_12_plus: { cover: 13, bare: 8 },
    },
    uniform_silt_loam: {
      flat_0_5: { cover: 25, bare: 13 },
      gentle_5_8: { cover: 20, bare: 10 },
      moderate_8_12: { cover: 15, bare: 8 },
      steep_12_plus: { cover: 10, bare: 5 },
    },
    silt_loam_compact: {
      flat_0_5: { cover: 15, bare: 8 },
      gentle_5_8: { cover: 13, bare: 6 },
      moderate_8_12: { cover: 10, bare: 4 },
      steep_12_plus: { cover: 8, bare: 3 },
    },
    heavy_clay: {
      flat_0_5: { cover: 5, bare: 4 },
      gentle_5_8: { cover: 4, bare: 3 },
      moderate_8_12: { cover: 3, bare: 2 },
      steep_12_plus: { cover: 3, bare: 2 },
    },
  };

  const rates = table[soil]?.[slope] ?? { cover: 25, bare: 15 };
  return hasVegetativeCover ? rates.cover : rates.bare;
}

/**
 * Water Available to Plants (AW) by Soil Type (Rain Bird Manual Page 21 & 29)
 * In mm of water per meter of soil depth (mm/m)
 */
export function getSoilAvailableWater(soil: SoilTextureType): { awMmPerM: number; description: string } {
  switch (soil) {
    case 'coarse_sandy':
    case 'coarse_sandy_compact':
      return { awMmPerM: 120, description: 'Coarse sand / Loamy sand (120 mm/m). High drainage, frequent short cycles required.' };
    case 'light_sandy_loam':
    case 'light_sandy_compact':
      return { awMmPerM: 145, description: 'Light sandy loam (145 mm/m). Balanced absorption and holding capacity.' };
    case 'uniform_silt_loam':
    case 'silt_loam_compact':
      return { awMmPerM: 170, description: 'Medium loam / Silt loam (170 mm/m). Excellent moisture retention.' };
    case 'heavy_clay':
      return { awMmPerM: 210, description: 'Heavy clay loam (210 mm/m). Very slow intake rate; cycle-and-soak mandatory.' };
    default:
      return { awMmPerM: 150, description: 'Medium texture soil (150 mm/m).' };
  }
}

/**
 * Rain Bird 3-Rules for Safe Water Capacity (Rain Bird Manual Ch 4, Pages 27-29)
 * Rule 1: Pressure loss through meter <= 10% of minimum static pressure in city main.
 * Rule 2: Flow through meter <= 75% of maximum safe continuous meter flow.
 * Rule 3: Velocity in service line <= 1.5 to 2.3 m/s (5 to 7.5 ft/s).
 */
export function calculateSafeWaterCapacityRules(
  staticPressureBar: number,
  meterSizeInch: '5/8' | '3/4' | '1' | '1_1/2' | '2' | '3',
  serviceLineSizeMm: 20 | 25 | 32 | 40 | 50
): {
  rule1FlowM3h: number;
  rule2FlowM3h: number;
  rule3FlowM3h: number;
  governingFlowM3h: number;
  governingRule: string;
} {
  // Safe continuous meter flow rating in m3/h (Rain Bird Manual page 28 & 119)
  const maxSafeMeterFlowM3h: Record<string, number> = {
    '5/8': 4.54,
    '3/4': 6.81,
    '1': 11.36,
    '1_1/2': 22.71,
    '2': 36.34,
    '3': 72.68,
  };

  const meterMax = maxSafeMeterFlowM3h[meterSizeInch] || 6.81;

  // Rule 1: 10% pressure loss limit through meter
  // Approx flow for <= 10% static pressure loss across AWWA meter
  const allowableLossBar = staticPressureBar * 0.1;
  // Based on Rain Bird AWWA curves: flow roughly scales with sqrt(loss)
  const rule1FlowM3h = Number(Math.min(meterMax * 0.95, meterMax * Math.sqrt(Math.max(0.2, allowableLossBar) / 0.8)).toFixed(2));

  // Rule 2: 75% of maximum safe meter flow
  const rule2FlowM3h = Number((meterMax * 0.75).toFixed(2));

  // Rule 3: Service line velocity limit <= 2.0 m/s (approx 6.5 ft/s safe limit)
  // Flow Q = V * Area = V * pi * (ID / 2000)^2 * 3600
  // Inner diameters for standard pipe sizes (approx):
  const innerDiametersM: Record<number, number> = {
    20: 0.016,
    25: 0.021,
    32: 0.028,
    40: 0.035,
    50: 0.045,
  };
  const idM = innerDiametersM[serviceLineSizeMm] || 0.021;
  const areaM2 = (Math.PI * Math.pow(idM, 2)) / 4;
  const maxVelocityMps = 2.0; // 2.0 m/s (6.5 ft/s)
  const rule3FlowM3h = Number((maxVelocityMps * areaM2 * 3600).toFixed(2));

  // Governing rule is the lowest (most restrictive)
  let governingFlowM3h = Math.min(rule1FlowM3h, rule2FlowM3h, rule3FlowM3h);
  let governingRule = 'Rule 3: Service Line Velocity (<= 2.0 m/s)';

  if (governingFlowM3h === rule1FlowM3h) {
    governingRule = 'Rule 1: 10% Water Meter Pressure Loss Limit';
  } else if (governingFlowM3h === rule2FlowM3h) {
    governingRule = 'Rule 2: 75% Safe Water Meter Rating Limit';
  }

  return {
    rule1FlowM3h,
    rule2FlowM3h,
    rule3FlowM3h,
    governingFlowM3h,
    governingRule,
  };
}

// -------------------------------------------------------------
// BOQ Financial Calculations & Totals
// -------------------------------------------------------------

export function calculateBOQTotals(
  items: BOQItem[],
  overheadProfitPercent: number = 15,
  contingencyPercent: number = 5,
  taxPercent: number = 5
): BOQSummary {
  const sectionSubtotals: Record<BOQSectionId, number> = {
    A_PREP: 0,
    B_SOFTSCAPE: 0,
    C_IRRIGATION: 0,
    D_HARDSCAPE: 0,
    E_LABOR: 0,
    F_MAINTENANCE: 0,
  };

  for (const item of items) {
    const amount = Number((item.quantity * item.unitRate).toFixed(2));
    if (sectionSubtotals[item.section] !== undefined) {
      sectionSubtotals[item.section] += amount;
    }
  }

  // Round section subtotals
  for (const key of Object.keys(sectionSubtotals) as BOQSectionId[]) {
    sectionSubtotals[key] = Number(sectionSubtotals[key].toFixed(2));
  }

  const directCostTotal = Number(
    Object.values(sectionSubtotals).reduce((acc, curr) => acc + curr, 0).toFixed(2)
  );

  const overheadProfitAmount = Number(((directCostTotal * overheadProfitPercent) / 100).toFixed(2));
  const contingencyAmount = Number(((directCostTotal * contingencyPercent) / 100).toFixed(2));

  const subtotalBeforeTax = Number((directCostTotal + overheadProfitAmount + contingencyAmount).toFixed(2));
  const taxAmount = Number(((subtotalBeforeTax * taxPercent) / 100).toFixed(2));
  const grandTotal = Number((subtotalBeforeTax + taxAmount).toFixed(2));

  return {
    sectionSubtotals,
    directCostTotal,
    overheadProfitPercent,
    overheadProfitAmount,
    contingencyPercent,
    contingencyAmount,
    subtotalBeforeTax,
    taxPercent,
    taxAmount,
    grandTotal,
  };
}

// -------------------------------------------------------------
// Auto-Generate Professional BOQ from Site Survey Data
// -------------------------------------------------------------

export function generateBOQFromSurvey(survey: SiteSurveyData): BOQItem[] {
  const items: BOQItem[] = [];
  let itemCounter = 1;

  const nextCode = (sectionPrefix: string) => {
    const code = `${sectionPrefix}-${String(itemCounter++).padStart(2, '0')}`;
    return code;
  };

  // ---------------------------------------------------------
  // SECTION A: PRELIMINARIES & SITE PREPARATION
  // ---------------------------------------------------------
  itemCounter = 1;
  const totalArea = survey.totalLandscapeAreaM2 || 350;
  const turfArea = survey.turfAreaM2 || 180;
  const bedsArea = survey.plantingBedsAreaM2 || 120;
  const hardscapeArea = survey.hardscapeAreaM2 || 50;

  items.push({
    id: 'item-prep-1',
    section: 'A_PREP',
    itemCode: nextCode('A'),
    category: 'Site Clearance',
    description: 'Site clearance and removal of builder debris, weeds, and uncompacted rubbish',
    specification: 'Hand and mechanical grubbing, removal off-site to authorized municipal landfill',
    quantity: totalArea,
    unit: 'm2',
    unitRate: 2.2,
    amount: totalArea * 2.2,
    isAutoGenerated: true,
  });

  items.push({
    id: 'item-prep-2',
    section: 'A_PREP',
    itemCode: nextCode('A'),
    category: 'Grading',
    description: 'Sub-grade excavation, contouring, and rough grading for proper surface drainage',
    specification: 'Laser level grading to 1.5% fall away from building foundations to prevent ponding',
    quantity: totalArea,
    unit: 'm2',
    unitRate: 3.5,
    amount: totalArea * 3.5,
    isAutoGenerated: true,
  });

  const soilDepthM = (survey.soilReplacementDepthCm || 25) / 100;
  const soilVolumeM3 = Math.round(bedsArea * soilDepthM + turfArea * 0.15);

  items.push({
    id: 'item-prep-3',
    section: 'A_PREP',
    itemCode: nextCode('A'),
    category: 'Imported Topsoil',
    description: 'Supply and spreading of premium sweet red sand / loam garden topsoil mix',
    specification: '70% washed sweet sand, 20% aged organic peat moss compost, 10% perlite with NPK enrichment',
    quantity: Math.max(15, soilVolumeM3),
    unit: 'm3',
    unitRate: 28.0,
    amount: Math.max(15, soilVolumeM3) * 28.0,
    isAutoGenerated: true,
  });

  items.push({
    id: 'item-prep-4',
    section: 'A_PREP',
    itemCode: nextCode('A'),
    category: 'Weed Barrier',
    description: 'Supply and installation of non-woven heavy-duty landscape geotextile fabric',
    specification: '120 gsm UV stabilized needle-punched polypropylene membrane under mulch beds and pathways',
    quantity: bedsArea + Math.round(hardscapeArea * 0.5),
    unit: 'm2',
    unitRate: 2.8,
    amount: (bedsArea + Math.round(hardscapeArea * 0.5)) * 2.8,
    isAutoGenerated: true,
  });

  // ---------------------------------------------------------
  // SECTION B: SOFTSCAPE & PLANT MATERIAL
  // ---------------------------------------------------------
  itemCounter = 1;

  // Turf grass
  if (survey.turfPreference.installationMethod === 'artificial') {
    items.push({
      id: 'item-soft-turf',
      section: 'B_SOFTSCAPE',
      itemCode: nextCode('B'),
      category: 'Turf',
      description: 'Supply and installation of premium 40mm landscape artificial turf',
      specification: 'UV-stabilized 4-tone synthetic fibers, 18,900 stitches/m2 with silica sand infill (8kg/m2)',
      quantity: turfArea,
      unit: 'm2',
      unitRate: 26.0,
      amount: turfArea * 26.0,
      isAutoGenerated: true,
    });
  } else {
    const turfName = survey.turfPreference.selectedType || 'Bermuda Grass (Tifway 419)';
    items.push({
      id: 'item-soft-turf',
      section: 'B_SOFTSCAPE',
      itemCode: nextCode('B'),
      category: 'Turf',
      description: `Supply and laying of fresh sod rolls: ${turfName}`,
      specification: 'Fresh cut weed-free cultivated turfgrass sod rolls, laid in staggered bond with rolling & initial soak',
      quantity: turfArea,
      unit: 'm2',
      unitRate: 7.5,
      amount: turfArea * 7.5,
      isAutoGenerated: true,
    });
  }

  // Shrubs / Hedges
  const hedgeLm = survey.shrubPreferences.hedgeLengthLm || Math.round(Math.sqrt(totalArea) * 2);
  const hedgeCount = Math.round(hedgeLm * 2.5); // approx 2.5 per meter for dense hedge

  items.push({
    id: 'item-soft-hedge',
    section: 'B_SOFTSCAPE',
    itemCode: nextCode('B'),
    category: 'Shrubs & Hedges',
    description: 'Perimeter hedge planting (e.g. Bougainvillea, Buxus, or Conocarpus)',
    specification: 'Bushy container-grown specimens 60-80cm height in 5L pots, spaced 40cm on center',
    quantity: hedgeCount,
    unit: 'Nos',
    unitRate: 14.0,
    amount: hedgeCount * 14.0,
    isAutoGenerated: true,
  });

  if (survey.shrubPreferences.hasFloweringBorders) {
    const borderShrubsCount = Math.round(bedsArea * 0.7);
    items.push({
      id: 'item-soft-flowering-shrubs',
      section: 'B_SOFTSCAPE',
      itemCode: nextCode('B'),
      category: 'Ornamental Shrubs',
      description: 'Mixed flowering shrubs (Jasminum sambac, Hibiscus, Tecoma stans, Ixora)',
      specification: 'Bushy multi-stem plants 40-60cm height in 3L-5L pots, enriched planting pit with slow-release fertilizer',
      quantity: Math.max(12, borderShrubsCount),
      unit: 'Nos',
      unitRate: 15.0,
      amount: Math.max(12, borderShrubsCount) * 15.0,
      isAutoGenerated: true,
    });
  }

  // Trees
  const shadeTrees = survey.treePreferences.shadeTreeCount || 2;
  const palmTrees = survey.treePreferences.palmTreeCount || 2;
  const fruitTrees = survey.treePreferences.fruitTreeCount || 2;

  if (shadeTrees > 0) {
    items.push({
      id: 'item-soft-shade-trees',
      section: 'B_SOFTSCAPE',
      itemCode: nextCode('B'),
      category: 'Specimen Trees',
      description: 'Large shade / canopy trees (Delonix regia, Neem, or Jacaranda)',
      specification: 'Height 2.5m - 3.0m, clear trunk, girth 12-14cm, rootballed with double timber lodge staking and hessian ties',
      quantity: shadeTrees,
      unit: 'Nos',
      unitRate: 210.0,
      amount: shadeTrees * 210.0,
      isAutoGenerated: true,
    });
  }

  if (palmTrees > 0) {
    items.push({
      id: 'item-soft-palms',
      section: 'B_SOFTSCAPE',
      itemCode: nextCode('B'),
      category: 'Palms',
      description: 'Architectural specimen palms (Phoenix dactylifera / Washingtonia robusta)',
      specification: 'Clear trunk 2.5m - 3.0m, fresh trimmed fronds, wire wrapped root ball with 3-way timber support bracing',
      quantity: palmTrees,
      unit: 'Nos',
      unitRate: 380.0,
      amount: palmTrees * 380.0,
      isAutoGenerated: true,
    });
  }

  if (fruitTrees > 0) {
    items.push({
      id: 'item-soft-fruit',
      section: 'B_SOFTSCAPE',
      itemCode: nextCode('B'),
      category: 'Fruit Trees',
      description: 'Citrus, Fig, or Olive fruit-bearing trees',
      specification: 'Grafted container-grown trees 1.8m - 2.0m height, established in 45L tubs, verified healthy grafting',
      quantity: fruitTrees,
      unit: 'Nos',
      unitRate: 140.0,
      amount: fruitTrees * 140.0,
      isAutoGenerated: true,
    });
  }

  // Ground covers & Mulch
  const groundCoverArea = Math.round(bedsArea * 0.45);
  items.push({
    id: 'item-soft-groundcover',
    section: 'B_SOFTSCAPE',
    itemCode: nextCode('B'),
    category: 'Ground Covers',
    description: 'Ground cover planting (Wedelia, Vinca, Gazania, Asparagus fern)',
    specification: 'Well rooted poly-sleeve rooted cuttings, planted at 16 plants per square meter with rooting stimulant',
    quantity: Math.max(20, groundCoverArea),
    unit: 'm2',
    unitRate: 8.5,
    amount: Math.max(20, groundCoverArea) * 8.5,
    isAutoGenerated: true,
  });

  const mulchArea = Math.max(15, bedsArea - groundCoverArea);
  const mulchDesc =
    survey.groundCoverPreferences.mulchType === 'volcanic_lava'
      ? 'Black volcanic basaltic lava stone mulch (20-30mm)'
      : survey.groundCoverPreferences.mulchType === 'river_pebbles'
      ? 'White polished decorative river pebbles (30-50mm)'
      : 'Natural graded shredded pine bark mulch (50mm depth)';
  const mulchRate =
    survey.groundCoverPreferences.mulchType === 'river_pebbles'
      ? 14.5
      : survey.groundCoverPreferences.mulchType === 'volcanic_lava'
      ? 11.5
      : 6.0;

  items.push({
    id: 'item-soft-mulch',
    section: 'B_SOFTSCAPE',
    itemCode: nextCode('B'),
    category: 'Mulching',
    description: `Decorative and moisture-conserving mulch: ${mulchDesc}`,
    specification: '50mm uniform compacted thickness laid over weed barrier geotextile membrane',
    quantity: mulchArea,
    unit: 'm2',
    unitRate: mulchRate,
    amount: mulchArea * mulchRate,
    isAutoGenerated: true,
  });

  // ---------------------------------------------------------
  // SECTION C: RAIN BIRD AUTOMATIC IRRIGATION SYSTEM
  // ---------------------------------------------------------
  itemCounter = 1;

  // Turf Sprinklers (Based on Rain Bird 1804 or 5004)
  // Turf area ~ 15m2 per spray head (at 4m spacing)
  const sprayHeadCount = Math.max(6, Math.ceil(turfArea / 14));
  items.push({
    id: 'item-irrig-sprayers',
    section: 'C_IRRIGATION',
    itemCode: nextCode('C'),
    category: 'Sprinklers',
    description: 'Rain Bird 1804 4-inch Pop-up Spray Sprinklers with HE-VAN / U-Series Nozzles',
    specification: 'Rain Bird 1800 Series body, pressure 2.1 bar, matched precipitation rate, wiper seal, swing joint assembly',
    quantity: sprayHeadCount,
    unit: 'Nos',
    unitRate: 11.5,
    amount: sprayHeadCount * 11.5,
    isAutoGenerated: true,
  });

  // Drip Irrigation Tubing for Beds (Rain Bird XFD)
  // ~ 2.5 Lm dripline per m2 of planting bed
  const driplineLm = Math.max(50, Math.round(bedsArea * 2.2));
  items.push({
    id: 'item-irrig-dripline',
    section: 'C_IRRIGATION',
    itemCode: nextCode('C'),
    category: 'Drip Line',
    description: 'Rain Bird XFD Pressure Compensating Brown Dripline 16mm (2.3 L/h @ 33cm spacing)',
    specification: 'Heavy-duty dual-layered UV resistant tubing with copper shield root intrusion protection',
    quantity: driplineLm,
    unit: 'Lm',
    unitRate: 2.2,
    amount: driplineLm * 2.2,
    isAutoGenerated: true,
  });

  // Tree Bubblers (Rain Bird 1400 Series)
  const totalTrees = (shadeTrees + palmTrees + fruitTrees) || 6;
  items.push({
    id: 'item-irrig-bubblers',
    section: 'C_IRRIGATION',
    itemCode: nextCode('C'),
    category: 'Bubblers',
    description: 'Rain Bird 1402 / 1404 Pressure Compensating Flood Bubblers for Tree Basins',
    specification: '0.5 GPM (1.9 L/min) or 1.0 GPM flow, mounted on 1/2" threaded riser with protective grate and basin ring',
    quantity: totalTrees * 2, // 2 bubblers per tree for balanced root zone
    unit: 'Nos',
    unitRate: 8.0,
    amount: totalTrees * 2 * 8.0,
    isAutoGenerated: true,
  });

  // Remote Control Solenoid Valves (Rain Bird PEB/PGA Series)
  // Usually 1 valve for lawn sprays, 1 for lawn parts, 1-2 for drip beds, 1 for trees = ~4-6 zones
  const estimatedZones = Math.max(4, Math.ceil((turfArea / 80) + (bedsArea / 70) + 1));
  items.push({
    id: 'item-irrig-valves',
    section: 'C_IRRIGATION',
    itemCode: nextCode('C'),
    category: 'Control Valves',
    description: 'Rain Bird 100-PEB / 150-PEB 1" or 1.5" Electric Remote Control Solenoid Valves 24VAC',
    specification: 'Industrial glass-filled nylon body, manual bleed, flow control handle, slow-closing diaphragm',
    quantity: estimatedZones,
    unit: 'Nos',
    unitRate: 75.0,
    amount: estimatedZones * 75.0,
    isAutoGenerated: true,
  });

  items.push({
    id: 'item-irrig-valve-boxes',
    section: 'C_IRRIGATION',
    itemCode: nextCode('C'),
    category: 'Valve Enclosures',
    description: 'Rain Bird VB Series Heavy-Duty Rectangular Underground Valve Boxes with Green Locking Lid',
    specification: 'High-density polyethylene body with crushed gravel drainage sump bedding (150mm depth)',
    quantity: Math.ceil(estimatedZones / 2),
    unit: 'Nos',
    unitRate: 35.0,
    amount: Math.ceil(estimatedZones / 2) * 35.0,
    isAutoGenerated: true,
  });

  // Mainline & Lateral Piping (Class 200 / HDPE PN10)
  const mainlineLengthM = Math.round(Math.sqrt(totalArea) * 1.8 + 25);
  const lateralLengthM = Math.round(totalArea * 0.45);

  items.push({
    id: 'item-irrig-mainline',
    section: 'C_IRRIGATION',
    itemCode: nextCode('C'),
    category: 'Mainline Pipe',
    description: 'Class 200 PVC / HDPE PN16 Mainline Pressure Pipe 32mm - 50mm (1.25" - 2")',
    specification: 'Solvent weld / electrofusion jointed pressure pipe laid in 500mm deep trench with warning tape & sand bedding',
    quantity: mainlineLengthM,
    unit: 'Lm',
    unitRate: 8.5,
    amount: mainlineLengthM * 8.5,
    isAutoGenerated: true,
  });

  items.push({
    id: 'item-irrig-laterals',
    section: 'C_IRRIGATION',
    itemCode: nextCode('C'),
    category: 'Lateral Pipe',
    description: 'Class 200 PVC / Polyethylene Lateral Pipe 25mm - 32mm (1" - 1.25")',
    specification: 'Trenching, pipe laying at 350mm depth, tee connections, fittings, compression adapters and backfill',
    quantity: lateralLengthM,
    unit: 'Lm',
    unitRate: 5.5,
    amount: lateralLengthM * 5.5,
    isAutoGenerated: true,
  });

  // Smart Controller & Sensors
  items.push({
    id: 'item-irrig-controller',
    section: 'C_IRRIGATION',
    itemCode: nextCode('C'),
    category: 'Automation',
    description: `Rain Bird ESP-TM2 / ESP-Me Smart WiFi ${estimatedZones <= 8 ? '8' : '12'}-Station Controller`,
    specification: 'Outdoor weather-resistant lockable cabinet, 230V/24VAC internal transformer, with LNK2 WiFi module',
    quantity: 1,
    unit: 'Set',
    unitRate: 260.0,
    amount: 260.0,
    isAutoGenerated: true,
  });

  items.push({
    id: 'item-irrig-sensor',
    section: 'C_IRRIGATION',
    itemCode: nextCode('C'),
    category: 'Sensors',
    description: 'Rain Bird RSD-BEx Direct-Wired Rain Sensor with Automatic Shut-off Bracket',
    specification: 'Adjustable rainfall threshold settings (3mm to 20mm), prevents irrigation during and after rain events',
    quantity: 1,
    unit: 'Nos',
    unitRate: 48.0,
    amount: 48.0,
    isAutoGenerated: true,
  });

  // Direct burial UF control cable
  const wireLengthM = Math.round(mainlineLengthM * 1.3);
  items.push({
    id: 'item-irrig-cable',
    section: 'C_IRRIGATION',
    itemCode: nextCode('C'),
    category: 'Cabling',
    description: 'Direct Burial UF 24VAC Irrigation Control Cable (1.5mm2 Station Wire + 2.5mm2 Common Ground)',
    specification: 'Solid copper conductors with waterproof silicone gel DBY wire nut splices inside valve boxes',
    quantity: wireLengthM,
    unit: 'Lm',
    unitRate: 1.8,
    amount: wireLengthM * 1.8,
    isAutoGenerated: true,
  });

  if (survey.backflowPreventerRequired) {
    items.push({
      id: 'item-irrig-backflow',
      section: 'C_IRRIGATION',
      itemCode: nextCode('C'),
      category: 'Backflow Unit',
      description: 'Pressure Vacuum Breaker (PVB) / Double Check Valve Assembly 1"',
      specification: 'Bronze body with shutoff isolation ball valves, test cocks, compliant with municipal plumbing code',
      quantity: 1,
      unit: 'Set',
      unitRate: 145.0,
      amount: 145.0,
      isAutoGenerated: true,
    });
  }

  // ---------------------------------------------------------
  // SECTION D: HARDSCAPE & EDGING
  // ---------------------------------------------------------
  itemCounter = 1;
  const edgingLm = Math.round(Math.sqrt(turfArea) * 3.5);

  items.push({
    id: 'item-hard-edging',
    section: 'D_HARDSCAPE',
    itemCode: nextCode('D'),
    category: 'Lawn Edging',
    description: 'Commercial Heavy-Duty Aluminum or Rigid Composite Garden Edge 100mm Depth',
    specification: 'Sleek dark anthracite / silver finish with anchor spikes every 60cm, separates lawn from gravel/mulch',
    quantity: edgingLm,
    unit: 'Lm',
    unitRate: 16.5,
    amount: edgingLm * 16.5,
    isAutoGenerated: true,
  });

  if (hardscapeArea > 0) {
    items.push({
      id: 'item-hard-pavers',
      section: 'D_HARDSCAPE',
      itemCode: nextCode('D'),
      category: 'Paving & Pathways',
      description: 'Outdoor porcelain / natural travertine stepping pavers (600x600x20mm)',
      specification: 'R11 slip-resistant finish, laid on crushed stone base with dry sand-cement mortar bed',
      quantity: hardscapeArea,
      unit: 'm2',
      unitRate: 65.0,
      amount: hardscapeArea * 65.0,
      isAutoGenerated: true,
    });
  }

  // ---------------------------------------------------------
  // SECTION E: LABOR, TESTING & COMMISSIONING
  // ---------------------------------------------------------
  itemCounter = 1;
  const plantingDays = Math.max(4, Math.round(totalArea / 60));

  items.push({
    id: 'item-labor-planting',
    section: 'E_LABOR',
    itemCode: nextCode('E'),
    category: 'Planting Labor',
    description: 'Skilled landscape horticulturist and labor gang for planting, sodding, and mulching',
    specification: 'Professional excavation of tree pits, rootball untangling, organic mixing, sod laying, and immediate watering',
    quantity: plantingDays,
    unit: 'Lot',
    unitRate: 350.0,
    amount: plantingDays * 350.0,
    isAutoGenerated: true,
  });

  items.push({
    id: 'item-labor-hydrostatic',
    section: 'E_LABOR',
    itemCode: nextCode('E'),
    category: 'Testing',
    description: 'Hydrostatic pipe pressure testing, lateral line flushing, nozzle arc adjustment & head calibration',
    specification: 'Pressurize mainline to 1.5x working pressure for 2 hours, verify zero pressure drop, adjust arcs for 0% overthrow',
    quantity: 1,
    unit: 'Lot',
    unitRate: 280.0,
    amount: 280.0,
    isAutoGenerated: true,
  });

  items.push({
    id: 'item-labor-asbuilt',
    section: 'E_LABOR',
    itemCode: nextCode('E'),
    category: 'Handover & Training',
    description: 'As-built irrigation schematic plan, zone valve chart, and client controller app orientation',
    specification: 'Laminated controller chart mounted inside cabinet door, mobile app connection, seasonal schedule programming',
    quantity: 1,
    unit: 'Lot',
    unitRate: 180.0,
    amount: 180.0,
    isAutoGenerated: true,
  });

  // ---------------------------------------------------------
  // SECTION F: OPERATIONS & MAINTENANCE GUARANTEE
  // ---------------------------------------------------------
  itemCounter = 1;
  items.push({
    id: 'item-maint-initial',
    section: 'F_MAINTENANCE',
    itemCode: nextCode('F'),
    category: 'Establishment Care',
    description: 'Comprehensive 90-day post-planting landscape establishment maintenance and plant warranty',
    specification: 'Bi-weekly visits: weed control, mowing, selective pruning, balanced fertilizing, pest checks, and full plant replacement warranty',
    quantity: 3,
    unit: 'Month',
    unitRate: 290.0,
    amount: 3 * 290.0,
    isAutoGenerated: true,
  });

  return items;
}

// -------------------------------------------------------------
// Rain Bird Hydraulic Zone Schedule Generator
// -------------------------------------------------------------

export function generateHydraulicZones(survey: SiteSurveyData): IrrigationZoneCalc[] {
  const zones: IrrigationZoneCalc[] = [];
  const safeCap = calculateSafeWaterCapacityRules(
    survey.staticPressureBar || 4.5,
    survey.waterMeterSizeInch || '1',
    survey.serviceLineSizeMm || 25
  );

  const turfArea = survey.turfAreaM2 || 180;
  const bedsArea = survey.plantingBedsAreaM2 || 120;
  const treeCount = (survey.treePreferences.shadeTreeCount + survey.treePreferences.palmTreeCount + survey.treePreferences.fruitTreeCount) || 6;

  let zoneIdx = 1;

  // If lawn turf is living sod, calculate spray zones
  if (survey.turfPreference.installationMethod !== 'artificial' && turfArea > 0) {
    // If turf area is moderate, split into 2 zones to keep within safe meter flow
    const turfZoneCount = turfArea > 120 ? 2 : 1;
    const areaPerZone = turfArea / turfZoneCount;
    const headsPerZone = Math.max(4, Math.round(areaPerZone / 15));
    // Each 1804 with 15-HE-VAN at 2.1 bar consumes approx 0.28 m3/h (1.2 gpm)
    const flowPerZone = Number((headsPerZone * 0.28).toFixed(2));
    const prMmH = calculatePrecipitationRateMetric(flowPerZone, 3.8, 3.8); // 3.8m spacing
    const weeklyReqMm = 35; // typical midsummer warm climate requirement
    const runTime = calculateOperatingTimeMinutes(weeklyReqMm, prMmH, survey.wateringDaysPerWeek || 5);

    for (let i = 0; i < turfZoneCount; i++) {
      zones.push({
        zoneNumber: zoneIdx++,
        zoneName: `Lawn Turf Sprays (Zone ${i + 1})`,
        areaM2: Math.round(areaPerZone),
        plantType: 'Turf Spray',
        emitterType: 'Rain Bird 1804 + 15-HE-VAN Nozzle',
        emitterCount: headsPerZone,
        flowM3h: flowPerZone,
        flowGpm: Number((flowPerZone * 4.403).toFixed(1)),
        precipitationRateMmH: prMmH,
        requiredWaterMmPerWeek: weeklyReqMm,
        operatingTimeMinPerDay: runTime,
        valveSize: '1" Rain Bird 100-PEB',
      });
    }
  }

  // Shrub Beds Drip Zones
  if (bedsArea > 0) {
    const driplineLm = Math.round(bedsArea * 2.2);
    // 2.3 L/h emitter per 33cm = 3 emitters per Lm = 6.9 L/h per meter = 0.0069 m3/h per meter
    const flowDripM3h = Number(((driplineLm * 6.9) / 1000).toFixed(2));
    // Equivalent application depth across bed area
    const prDripMmH = Number(((flowDripM3h * 1000) / bedsArea).toFixed(1));
    const weeklyReqMm = 28;
    const runTime = calculateOperatingTimeMinutes(weeklyReqMm, prDripMmH, survey.wateringDaysPerWeek || 4);

    zones.push({
      zoneNumber: zoneIdx++,
      zoneName: 'Perimeter Shrubs & Hedge Beds',
      areaM2: Math.round(bedsArea * 0.7),
      plantType: 'Shrubs Drip',
      emitterType: 'Rain Bird XFD Dripline (2.3 L/h @ 33cm)',
      emitterCount: Math.round(driplineLm * 3),
      flowM3h: flowDripM3h,
      flowGpm: Number((flowDripM3h * 4.403).toFixed(1)),
      precipitationRateMmH: prDripMmH,
      requiredWaterMmPerWeek: weeklyReqMm,
      operatingTimeMinPerDay: runTime,
      valveSize: '1" Rain Bird 100-PEB',
    });
  }

  // Tree Bubbler Zone
  if (treeCount > 0) {
    // 2 bubblers per tree, 1402 is 0.5 GPM = 1.9 L/min = 0.114 m3/h per bubbler
    const bubblerCount = treeCount * 2;
    const bubblerFlowM3h = Number((bubblerCount * 0.114).toFixed(2));
    const basinAreaM2 = treeCount * 2.0; // 2 m2 basin per tree
    const prBubblerMmH = Number(((bubblerFlowM3h * 1000) / basinAreaM2).toFixed(1));
    const weeklyReqMm = 45; // deep root saturation
    const runTime = calculateOperatingTimeMinutes(weeklyReqMm, prBubblerMmH, 3); // 3 days/week deep soak

    zones.push({
      zoneNumber: zoneIdx++,
      zoneName: 'Specimen Trees & Palms Deep Basin',
      areaM2: Math.round(basinAreaM2),
      plantType: 'Trees Bubbler',
      emitterType: 'Rain Bird 1402 PC Flood Bubbler (0.5 GPM)',
      emitterCount: bubblerCount,
      flowM3h: bubblerFlowM3h,
      flowGpm: Number((bubblerFlowM3h * 4.403).toFixed(1)),
      precipitationRateMmH: prBubblerMmH,
      requiredWaterMmPerWeek: weeklyReqMm,
      operatingTimeMinPerDay: runTime,
      valveSize: '1" Rain Bird 100-PEB',
    });
  }

  // Feature Flower Beds Micro-spray / Drip
  if (survey.shrubPreferences.hasFloweringBorders) {
    zones.push({
      zoneNumber: zoneIdx++,
      zoneName: 'Patio Flowering Beds & Accent Planters',
      areaM2: Math.round(bedsArea * 0.3),
      plantType: 'Flowers Micro-spray',
      emitterType: 'Rain Bird XS Micro-Sprays / Dripline',
      emitterCount: 16,
      flowM3h: 0.85,
      flowGpm: 3.7,
      precipitationRateMmH: 24.0,
      requiredWaterMmPerWeek: 30,
      operatingTimeMinPerDay: calculateOperatingTimeMinutes(30, 24.0, survey.wateringDaysPerWeek || 5),
      valveSize: '1" Rain Bird 100-PEB',
    });
  }

  return zones;
}

// -------------------------------------------------------------
// Currency Formatting & Default Sample Survey Data
// -------------------------------------------------------------

export function formatCurrencyValue(amount: number, currency: Currency): string {
  const currencySymbols: Record<Currency, { symbol: string; decimals: number }> = {
    USD: { symbol: '$', decimals: 2 },
    AED: { symbol: 'AED ', decimals: 2 },
    SAR: { symbol: 'SAR ', decimals: 2 },
    QAR: { symbol: 'QAR ', decimals: 2 },
    OMR: { symbol: 'OMR ', decimals: 3 },
    KWD: { symbol: 'KWD ', decimals: 3 },
    BHD: { symbol: 'BHD ', decimals: 3 },
    PKR: { symbol: 'Rs. ', decimals: 0 },
    INR: { symbol: '₹', decimals: 2 },
    EUR: { symbol: '€', decimals: 2 },
    GBP: { symbol: '£', decimals: 2 },
    CAD: { symbol: 'C$', decimals: 2 },
    AUD: { symbol: 'A$', decimals: 2 },
    SGD: { symbol: 'S$', decimals: 2 },
    MYR: { symbol: 'RM ', decimals: 2 },
    EGP: { symbol: 'EGP ', decimals: 2 },
    TRY: { symbol: '₺', decimals: 2 },
  };

  const item = currencySymbols[currency] || { symbol: '$', decimals: 2 };
  return `${item.symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: item.decimals,
    maximumFractionDigits: item.decimals,
  })}`;
}

export const DEFAULT_SITE_SURVEY: SiteSurveyData = {
  projectName: 'Emerald Oasis Villa Garden & Irrigation Project',
  projectNumber: 'KG-LS-2026-084',
  clientName: 'Tariq Al-Mansoor',
  clientPhone: '+971 50 847 2910',
  clientEmail: 'kahfgreens@gmail.com',
  siteAddress: 'Villa 42, Palm Hills Enclave, District 7',
  surveyDate: new Date().toISOString().split('T')[0],
  surveyorName: 'Engr. M. Kahf (Landscape Architect)',
  currency: 'USD',
  targetTimelineWeeks: 5,
  projectType: 'residential_villa',

  totalPlotAreaM2: 650,
  totalLandscapeAreaM2: 380,
  turfAreaM2: 190,
  plantingBedsAreaM2: 130,
  hardscapeAreaM2: 60,

  turfPreference: {
    selectedType: 'Bermuda Grass (Tifway 419)',
    areaM2: 190,
    usageIntensity: 'high_traffic',
    installationMethod: 'sod_rolls',
  },

  shrubPreferences: {
    hedgeLengthLm: 45,
    hedgeHeightCategory: 'medium_privacy',
    hasFloweringBorders: true,
    hasFormalBoxwoodBedges: true,
    preferredSpecies: ['Bougainvillea spectabilis', 'Buxus sempervirens', 'Jasminum sambac', 'Hibiscus rosa-sinensis'],
  },

  treePreferences: {
    shadeTreeCount: 2,
    palmTreeCount: 3,
    fruitTreeCount: 2,
    ornamentalTreeCount: 1,
    preferredSpecies: ['Phoenix dactylifera (Date Palm)', 'Delonix regia (Poinciana)', 'Olea europaea (Olive Tree)', 'Plumeria rubra (Frangipani)'],
    useTreeStakes: true,
    useMulchRings: true,
  },

  groundCoverPreferences: {
    areaM2: 50,
    mulchType: 'pine_bark',
    mulchDepthCm: 5,
    preferredSpecies: ['Wedelia trilobata', 'Vinca major', 'Asparagus densiflorus'],
  },

  soilTexture: 'light_sandy_loam',
  soilInfiltrationRateMmH: 32,
  slopeCategory: 'flat_0_5',
  slopePercent: 2,
  sunExposure: 'full_sun',
  windCondition: 'moderate_6_11',
  prevailingWindDirection: 'North-West (NW)',
  drainageCondition: 'good',
  soilReplacementDepthCm: 25,
  organicCompostMixPercent: 20,

  waterSource: 'municipal_main',
  staticPressureBar: 4.8,
  waterMeterSizeInch: '1',
  serviceLineSizeMm: 25,
  serviceLineMaterial: 'copper_k',
  serviceLineLengthM: 18,
  elevationChangeM: 0.6,
  backflowPreventerRequired: true,
  powerSourceAvailable: true,
  powerVoltage: '230V_50Hz',
  powerLocation: 'Garage Electrical DB Panel',
  waterWindowHoursPerDay: 7,
  wateringDaysPerWeek: 5,

  clientSpecialNotes: 'Client requests fragrant Arabian Jasmine near master bedroom patio. Low water drift near living room French windows. Child and pet-friendly soft turfgrass.',
  siteAccessConstraints: 'Side passage 1.4m width for mini dumper access. Water meter located at front curb.',
};
