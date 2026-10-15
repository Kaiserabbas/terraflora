import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePrecipitationRateMetric,
  calculatePrecipitationRateUS,
  calculateOperatingTimeMinutes,
  getMaxPrecipitationRate,
  calculateSafeWaterCapacityRules,
  calculateBOQTotals,
  generateBOQFromSurvey,
  DEFAULT_SITE_SURVEY,
} from './calculations.ts';
import type { BOQItem } from '../types/landscape.ts';

test('Rain Bird Metric precipitation rate matches manual formula', () => {
  // Manual page 44: 1 m3/h over 12m x 12m = 6.94 mm/h
  const pr = calculatePrecipitationRateMetric(1.0, 12, 12);
  assert.equal(pr, 6.94);

  // Manual page 53: 0.56 m3/h over 3m x 4m = 46.67 mm/h
  const pr2 = calculatePrecipitationRateMetric(0.56, 3, 4);
  assert.equal(pr2, 46.67);
});

test('Rain Bird US Standard precipitation rate matches manual formula', () => {
  // Manual page 44: 4.4 gpm over 40ft x 40ft = 0.265 in/h
  const prUS = calculatePrecipitationRateUS(4.4, 40, 40);
  assert.equal(prUS, 0.265);

  // Manual page 53: 2.4 gpm over 11ft x 12ft = 1.751 in/h
  const prUS2 = calculatePrecipitationRateUS(2.4, 11, 12);
  assert.equal(prUS2, 1.751);
});

test('Circuit operating time OT = (I * 60) / (PR * DA) matches manual', () => {
  // Manual page 59: I = 38 mm/wk, PR = 39.5 mm/h, DA = 3 days/wk
  // OT = (38 * 60) / (39.5 * 3) = 2280 / 118.5 = 19.24 => 19 mins
  const ot1 = calculateOperatingTimeMinutes(38, 39.5, 3);
  assert.equal(ot1, 19);

  // Manual page 59: I = 38 mm/wk, PR = 6 mm/h, DA = 3 days/wk
  // OT = (38 * 60) / (6 * 3) = 2280 / 18 = 126.66 => 127 mins
  const ot2 = calculateOperatingTimeMinutes(38, 6, 3);
  assert.equal(ot2, 127);
});

test('Max precipitation rate correctly looks up slope and soil constraints', () => {
  // Coarse sandy on flat with cover = 51 mm/h
  assert.equal(getMaxPrecipitationRate('coarse_sandy', 'flat_0_5', true), 51);
  // Heavy clay on steep bare = 2 mm/h
  assert.equal(getMaxPrecipitationRate('heavy_clay', 'steep_12_plus', false), 2);
});

test('Safe water meter rules return valid flow constraints', () => {
  const result = calculateSafeWaterCapacityRules(4.5, '1', 25);
  assert.ok(result.rule1FlowM3h > 0);
  assert.ok(result.rule2FlowM3h > 0);
  assert.ok(result.rule3FlowM3h > 0);
  assert.ok(result.governingFlowM3h <= result.rule1FlowM3h);
  assert.ok(result.governingFlowM3h <= result.rule2FlowM3h);
  assert.ok(result.governingFlowM3h <= result.rule3FlowM3h);
});

test('BOQ totals correctly calculate subtotals, markup, contingency, and tax', () => {
  const sampleItems: BOQItem[] = [
    {
      id: '1',
      section: 'A_PREP',
      itemCode: 'A-01',
      category: 'Prep',
      description: 'Clearance',
      specification: 'Hand',
      quantity: 100,
      unit: 'm2',
      unitRate: 2,
      amount: 200,
    },
    {
      id: '2',
      section: 'B_SOFTSCAPE',
      itemCode: 'B-01',
      category: 'Turf',
      description: 'Grass',
      specification: 'Sod',
      quantity: 100,
      unit: 'm2',
      unitRate: 8,
      amount: 800,
    },
  ];

  const totals = calculateBOQTotals(sampleItems, 10, 5, 5);
  // Direct cost: 1000
  assert.equal(totals.directCostTotal, 1000);
  // Section A: 200, Section B: 800
  assert.equal(totals.sectionSubtotals.A_PREP, 200);
  assert.equal(totals.sectionSubtotals.B_SOFTSCAPE, 800);
  // Overhead 10%: 100
  assert.equal(totals.overheadProfitAmount, 100);
  // Contingency 5%: 50
  assert.equal(totals.contingencyAmount, 50);
  // Subtotal before tax: 1150
  assert.equal(totals.subtotalBeforeTax, 1150);
  // Tax 5%: 57.50
  assert.equal(totals.taxAmount, 57.5);
  // Grand total: 1207.50
  assert.equal(totals.grandTotal, 1207.5);
});

test('generateBOQFromSurvey builds all 6 required divisions', () => {
  const items = generateBOQFromSurvey(DEFAULT_SITE_SURVEY);
  assert.ok(items.length >= 10);
  const sections = new Set(items.map((i) => i.section));
  assert.ok(sections.has('A_PREP'));
  assert.ok(sections.has('B_SOFTSCAPE'));
  assert.ok(sections.has('C_IRRIGATION'));
  assert.ok(sections.has('D_HARDSCAPE'));
  assert.ok(sections.has('E_LABOR'));
  assert.ok(sections.has('F_MAINTENANCE'));
});
