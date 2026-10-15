import type { IrrigationZoneCalc, PlacedZone, SiteLayoutConfig } from '../types/landscape.ts';

export const ZONE_COLOR_PALETTES = [
  { bg: '#0284c7', border: '#0369a1', fill: 'rgba(2, 132, 199, 0.25)', label: 'Turf Spray (Blue)' },
  { bg: '#059669', border: '#047857', fill: 'rgba(5, 150, 105, 0.25)', label: 'Shrub Drip (Emerald)' },
  { bg: '#d97706', border: '#b45309', fill: 'rgba(217, 119, 6, 0.25)', label: 'Tree Bubbler (Amber)' },
  { bg: '#8b5cf6', border: '#7c3aed', fill: 'rgba(139, 92, 246, 0.25)', label: 'Micro-Spray (Violet)' },
  { bg: '#0d9488', border: '#0f766e', fill: 'rgba(13, 148, 136, 0.25)', label: 'Turf Rotor (Teal)' },
  { bg: '#e11d48', border: '#be123c', fill: 'rgba(225, 29, 72, 0.25)', label: 'Perimeter Hedge (Rose)' },
];

export const DEFAULT_SITE_PRESETS: Record<string, { name: string; description: string; config: SiteLayoutConfig }> = {
  villa: {
    name: 'Suburban Villa Estate (25m × 18m)',
    description: 'Standard residential villa with front yard, back garden lawn, swimming pool, and perimeter planter beds.',
    config: {
      siteWidthM: 25,
      siteLengthM: 18,
      gridSizeM: 1,
      snapToGrid: true,
      pocLocation: { x: 1.5, y: 16.5, label: 'POC: Municipal Meter & Backflow' },
      controllerLocation: { x: 7.5, y: 11, label: 'Controller: Rain Bird ESP-TM2 (Garage)' },
      elements: [
        {
          id: 'villa-main',
          name: 'Main Villa Residence',
          type: 'villa',
          x: 7,
          y: 5,
          widthM: 11,
          heightM: 7,
          color: '#e2e8f0',
        },
        {
          id: 'driveway',
          name: 'Paved Driveway & Parking',
          type: 'driveway',
          x: 1,
          y: 11,
          widthM: 5,
          heightM: 6,
          color: '#cbd5e1',
        },
        {
          id: 'swimming-pool',
          name: 'Swimming Pool',
          type: 'pool',
          x: 19,
          y: 7,
          widthM: 4.5,
          heightM: 3.5,
          color: '#bae6fd',
        },
        {
          id: 'patio-terrace',
          name: 'Outdoor Patio & Deck',
          type: 'patio',
          x: 18.5,
          y: 5,
          widthM: 5.5,
          heightM: 7.5,
          color: '#fed7aa',
        },
        {
          id: 'front-entry-path',
          name: 'Entry Walkway',
          type: 'pathway',
          x: 6,
          y: 12,
          widthM: 1,
          heightM: 5,
          color: '#e2e8f0',
        },
      ],
    },
  },
  courtyard: {
    name: 'Modern Courtyard & Garden (20m × 15m)',
    description: 'Contemporary walled courtyard villa with central terrace, plunge pool, and lush foliage corners.',
    config: {
      siteWidthM: 20,
      siteLengthM: 15,
      gridSizeM: 1,
      snapToGrid: true,
      pocLocation: { x: 1, y: 14, label: 'POC: Water Meter' },
      controllerLocation: { x: 5, y: 10, label: 'Controller: ESP-Me WiFi' },
      elements: [
        {
          id: 'villa-l-shape',
          name: 'Courtyard Residence',
          type: 'villa',
          x: 4,
          y: 3,
          widthM: 12,
          heightM: 6,
          color: '#e2e8f0',
        },
        {
          id: 'courtyard-pool',
          name: 'Reflective Plunge Pool',
          type: 'pool',
          x: 7,
          y: 10,
          widthM: 6,
          heightM: 3,
          color: '#bae6fd',
        },
        {
          id: 'courtyard-deck',
          name: 'Timber Sun Deck',
          type: 'patio',
          x: 13,
          y: 9.5,
          widthM: 4,
          heightM: 4,
          color: '#fed7aa',
        },
      ],
    },
  },
  xeriscape: {
    name: 'Desert Xeriscape Plot (30m × 20m)',
    description: 'Expansive low-water landscape with date palm grove, rock gardens, and gravel walking pathways.',
    config: {
      siteWidthM: 30,
      siteLengthM: 20,
      gridSizeM: 1,
      snapToGrid: true,
      pocLocation: { x: 2, y: 18, label: 'POC: TSE Recycled Water Line' },
      controllerLocation: { x: 8, y: 14, label: 'Controller: Rain Bird ESP-LXME' },
      elements: [
        {
          id: 'estate-pavilion',
          name: 'Main Villa & Majlis',
          type: 'villa',
          x: 8,
          y: 5,
          widthM: 14,
          heightM: 8,
          color: '#e2e8f0',
        },
        {
          id: 'xeriscape-walk',
          name: 'Desert Stone Pathway',
          type: 'pathway',
          x: 2,
          y: 13,
          widthM: 6,
          heightM: 2,
          color: '#fde68a',
        },
        {
          id: 'shaded-pergola',
          name: 'Shaded Seating Pergola',
          type: 'patio',
          x: 23,
          y: 6,
          widthM: 5,
          heightM: 5,
          color: '#fed7aa',
        },
      ],
    },
  },
};

/**
 * Initializes PlacedZones from calculated hydraulic zones
 * with logical default coordinates on the site layout.
 */
export function initializePlacedZones(
  zones: IrrigationZoneCalc[],
  siteConfig: SiteLayoutConfig = DEFAULT_SITE_PRESETS.villa.config
): PlacedZone[] {
  // Pre-calculated strategic positions for common zone types on a 25x18m site
  const defaultPlacements = [
    // Zone 1: Front Lawn Turf Sprays
    { x: 1, y: 1, widthM: 6, heightM: 9, shape: 'rect' as const },
    // Zone 2: Back/Side Lawn Turf Sprays or Shrub Drip
    { x: 8, y: 1, widthM: 9, heightM: 3.5, shape: 'rect' as const },
    // Zone 3: Perimeter Planting Beds & Hedge Drip
    { x: 18, y: 1, widthM: 6, heightM: 3.5, shape: 'rect' as const },
    // Zone 4: Specimen Palm & Tree Bubblers
    { x: 1, y: 11, widthM: 5, heightM: 4.5, shape: 'rect' as const },
    // Zone 5: Patio Planters / Accent Micro-sprays
    { x: 18.5, y: 13, widthM: 5.5, heightM: 3.5, shape: 'rect' as const },
    // Zone 6: Additional zones if present
    { x: 8, y: 13, widthM: 9, heightM: 3.5, shape: 'rect' as const },
  ];

  return zones.map((z, idx) => {
    const defaultPos = defaultPlacements[idx % defaultPlacements.length];
    const colorTheme = ZONE_COLOR_PALETTES[idx % ZONE_COLOR_PALETTES.length];

    // Determine spray radius based on emitter type
    let sprayRadiusM = 3.8;
    if (z.plantType.includes('Rotor')) {
      sprayRadiusM = 9.0;
    } else if (z.plantType.includes('Drip')) {
      sprayRadiusM = 0.5;
    } else if (z.plantType.includes('Bubbler')) {
      sprayRadiusM = 1.0;
    } else if (z.plantType.includes('Flowers') || z.plantType.includes('Micro')) {
      sprayRadiusM = 1.5;
    }

    // Default valve location near the corner of the zone closest to POC
    const valveX = Number((defaultPos.x + 0.5).toFixed(1));
    const valveY = Number((defaultPos.y + 0.5).toFixed(1));

    return {
      ...z,
      id: `placed-zone-${z.zoneNumber}`,
      x: defaultPos.x,
      y: defaultPos.y,
      widthM: defaultPos.widthM,
      heightM: defaultPos.heightM,
      isPlaced: true,
      color: colorTheme.bg,
      shape: defaultPos.shape,
      sprayRadiusM,
      valveLocation: { x: valveX, y: valveY },
    };
  });
}
