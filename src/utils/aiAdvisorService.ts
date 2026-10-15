import type { BOQItem, SiteSurveyData } from '../types/landscape.ts';

export interface AIAdvisorResponse {
  executiveConcept: string;
  recommendedPlants: {
    commonName: string;
    botanicalName: string;
    category: string;
    reason: string;
    suggestedQty: number;
    unit: string;
    estRateUSD: number;
  }[];
  outdoorLivingRecommendations: {
    itemName: string;
    category: string;
    placementReason: string;
    suggestedQty: number;
    unit: string;
    estRateUSD: number;
  }[];
  irrigationEngineeringAdvice: string;
  boqAdditions: {
    section: 'A_PREP' | 'B_SOFTSCAPE' | 'C_IRRIGATION' | 'D_HARDSCAPE' | 'E_LABOR' | 'F_MAINTENANCE';
    category: string;
    description: string;
    specification: string;
    quantity: number;
    unit: 'm2' | 'm3' | 'Lm' | 'Nos' | 'Set' | 'Bag' | 'Lot' | 'Month' | 'Trip';
    unitRateUSD: number;
  }[];
}

// Client-side domain-expert generator fallback (in case Gemini API key is missing or offline)
function generateIntelligentFallback(survey: SiteSurveyData): AIAdvisorResponse {
  const isVilla = survey.projectType === 'residential_villa';
  const hasSand = survey.soilTexture.includes('sandy');
  const highSun = survey.sunExposure === 'full_sun';

  const executiveConcept = `TerraFlora Architectural Vision for ${survey.projectName || 'Private Estate'}:
A sustainable, biophilic oasis tailored to the ${survey.siteAddress || 'arid microclimate'}. Balancing lush green recreational turf (${survey.turfAreaM2} m²) with low-water xeriscape borders, aromatic night-blooming jasmine, architectural specimen palms, and shaded outdoor living lounges with UV-resistant cantilever umbrellas and all-weather seating. Engineered strictly according to Rain Bird hydraulic standards for optimal water conservation and zero runoff on ${survey.slopePercent}% slope.`;

  const recommendedPlants = [
    {
      commonName: 'Royal Poinciana / Flamboyant',
      botanicalName: 'Delonix regia',
      category: 'Specimen Shade Tree',
      reason: 'Spectacular canopy shade, drought hardy once established, tolerates sandy alkaline soil.',
      suggestedQty: Math.max(2, survey.treePreferences.shadeTreeCount || 2),
      unit: 'Nos',
      estRateUSD: 180,
    },
    {
      commonName: 'Arabian Jasmine (Motia / Full)',
      botanicalName: 'Jasminum sambac',
      category: 'Fragrant Flowering Shrub',
      reason: 'Intensely fragrant white evening blooms near seating areas; heat loving and compact.',
      suggestedQty: Math.max(12, Math.round(survey.plantingBedsAreaM2 * 0.2)),
      unit: 'Nos',
      estRateUSD: 9.5,
    },
    {
      commonName: 'Bougainvillea Cascading Shrub',
      botanicalName: 'Bougainvillea spectabilis',
      category: 'Perimeter Hedge / Screen',
      reason: 'Vibrant year-round magenta bracts, highly salt & drought tolerant, dense security hedge.',
      suggestedQty: Math.max(10, Math.round(survey.shrubPreferences.hedgeLengthLm * 2)),
      unit: 'Nos',
      estRateUSD: 11,
    },
    {
      commonName: 'Ancient Mediterranean Olive Tree',
      botanicalName: 'Olea europaea',
      category: 'Focal Specimen Tree',
      reason: 'Iconic sculptural gnarled trunk, ultra-low water demand, stunning with warm LED uplighting.',
      suggestedQty: Math.max(1, survey.treePreferences.fruitTreeCount || 1),
      unit: 'Nos',
      estRateUSD: 450,
    },
    {
      commonName: 'Yellow Trailing Wedelia',
      botanicalName: 'Sphagneticola trilobata',
      category: 'Living Ground Cover',
      reason: 'Forms a dense green carpet with cheerful yellow blooms, suppresses weeds and cools root zone.',
      suggestedQty: Math.max(30, survey.groundCoverPreferences.areaM2 || 40),
      unit: 'm2',
      estRateUSD: 8,
    },
  ];

  const outdoorLivingRecommendations = [
    {
      itemName: '3m x 3m Rotating Cantilever Umbrella (Sunbrella Fabric)',
      category: 'Outdoor Shading & Parasols',
      placementReason: 'Flexible 360° pivot shade over the poolside / patio dining area with heavy granite base to withstand afternoon breeze.',
      suggestedQty: 1,
      unit: 'Nos',
      estRateUSD: 520,
    },
    {
      itemName: 'Luxury 5-Seater UV Resin Rattan Corner Sofa Lounge',
      category: 'Garden Living & Furniture',
      placementReason: 'Weatherproof high-density wicker with quick-dry olefin cushions for year-round garden entertaining.',
      suggestedQty: 1,
      unit: 'Set',
      estRateUSD: 1250,
    },
    {
      itemName: 'Grade-A Solid Teak & Cast Aluminum Garden Bench (1.8m)',
      category: 'Garden Seating & Rest Nooks',
      placementReason: 'Shaded morning relaxation spot positioned beneath the Delonix canopy.',
      suggestedQty: 1,
      unit: 'Nos',
      estRateUSD: 220,
    },
    {
      itemName: 'Italian Vitrified Porcelain Pavers 60x60cm (R11 Anti-Slip)',
      category: 'Hardscape & Terrace Paving',
      placementReason: 'Heat-resistant, stain-proof patio surface that stays comfortable under bare feet in high summer.',
      suggestedQty: Math.max(30, survey.hardscapeAreaM2 || 50),
      unit: 'm2',
      estRateUSD: 34,
    },
    {
      itemName: 'Pure White Thassos Marble River Pebbles (30-50mm)',
      category: 'Decorative Dry Garden & Mulch',
      placementReason: 'Contrasting decorative stone border around palms and along patio edges over geotextile.',
      suggestedQty: Math.max(15, Math.round(survey.plantingBedsAreaM2 * 0.15)),
      unit: 'm2',
      estRateUSD: 15,
    },
  ];

  const irrigationEngineeringAdvice = `Rain Bird Hydraulic Evaluation:
• Available Static Pressure: ${survey.staticPressureBar} bar. Safe Working Operating Pressure: ${(survey.staticPressureBar * 0.8).toFixed(1)} bar.
• Soil Texture: ${survey.soilTexture} with infiltration rate of ${survey.soilInfiltrationRateMmH} mm/h.
• Slope Factor: At ${survey.slopePercent}%, enforce a maximum application rate to prevent soil erosion and water runoff.
• Recommended Cycle-and-Soak: Split daily turf watering into 2 cycles of 6-8 minutes with a 30-minute soak interval.
• Drip Circuiting: Use Rain Bird XFD 16mm pressure-compensating subsurface dripline with copper shield technology to prevent root intrusion.
• Smart Automation: Rain Bird ESP-TM2 WiFi controller with rain/freeze sensor to save 35% seasonal water.`;

  const boqAdditions = [
    {
      section: 'D_HARDSCAPE' as const,
      category: 'Outdoor Shading',
      description: '3m x 3m Square Rotating Cantilever Umbrella with 120kg Granite Base',
      specification: 'Commercial grade powder-coated aluminum mast, Sunbrella UV50+ fabric canopy, 360-degree foot pedal rotation, tilt crank',
      quantity: 1,
      unit: 'Nos' as const,
      unitRateUSD: 520,
    },
    {
      section: 'D_HARDSCAPE' as const,
      category: 'Garden Furniture',
      description: 'Luxury 5-Seater Outdoor Rattan Sectional Sofa with Coffee Table',
      specification: 'UV-resistant hand-woven synthetic resin wicker, aluminum frame, 12cm Olefin weather-resistant foam cushions',
      quantity: 1,
      unit: 'Set' as const,
      unitRateUSD: 1250,
    },
    {
      section: 'D_HARDSCAPE' as const,
      category: 'Garden Bench',
      description: 'Solid Plantation Teak & Cast Aluminum Garden Park Bench (1.8m)',
      specification: '180cm width, contoured Grade-A teak slats with marine UV finish, powder-coated rustproof dark anthracite frame',
      quantity: 1,
      unit: 'Nos' as const,
      unitRateUSD: 220,
    },
    {
      section: 'A_PREP' as const,
      category: 'Subsurface Drainage',
      description: 'Geotextile Separation Membrane (150 GSM Non-Woven)',
      specification: 'Needle-punched polypropylene geotextile fabric beneath hardscape pavers and gravel beds to prevent weed growth and subgrade migration',
      quantity: Math.max(50, survey.hardscapeAreaM2 + survey.groundCoverPreferences.areaM2),
      unit: 'm2' as const,
      unitRateUSD: 2.2,
    },
    {
      section: 'C_IRRIGATION' as const,
      category: 'Smart Sensor',
      description: 'Rain Bird WR2-RFC Wireless Rain and Freeze Shutoff Sensor',
      specification: 'Automated wireless sensor communicating with ESP-TM2 controller to instantly halt irrigation cycles during wet weather',
      quantity: 1,
      unit: 'Nos' as const,
      unitRateUSD: 95,
    },
  ];

  return {
    executiveConcept,
    recommendedPlants,
    outdoorLivingRecommendations,
    irrigationEngineeringAdvice,
    boqAdditions,
  };
}

export async function requestAIAdvisor(
  survey: SiteSurveyData,
  currentItems: BOQItem[]
): Promise<AIAdvisorResponse> {
  try {
    const res = await fetch('/api/ai/landscape-advisor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ survey, currentItems }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.executiveConcept) {
        return data as AIAdvisorResponse;
      }
    }
  } catch (err) {
    console.warn('AI Advisor API call failed, using intelligent domain synthesis fallback:', err);
  }

  // Fallback to high-fidelity domain synthesis
  return generateIntelligentFallback(survey);
}
