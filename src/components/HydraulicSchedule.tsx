import React from 'react';
import {
  Activity,
  Droplets,
  Gauge,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  Info,
  Layers,
} from 'lucide-react';
import type { SiteSurveyData, IrrigationZoneCalc } from '../types/landscape.ts';
import {
  calculateSafeWaterCapacityRules,
  getMaxPrecipitationRate,
  getSoilAvailableWater,
} from '../utils/calculations.ts';

interface HydraulicScheduleProps {
  survey: SiteSurveyData;
  zones: IrrigationZoneCalc[];
  onExportExcel: () => void;
}

export const HydraulicSchedule: React.FC<HydraulicScheduleProps> = ({
  survey,
  zones,
  onExportExcel,
}) => {
  const safeCap = calculateSafeWaterCapacityRules(
    survey.staticPressureBar,
    survey.waterMeterSizeInch,
    survey.serviceLineSizeMm
  );

  const maxSoilPR = getMaxPrecipitationRate(survey.soilTexture, survey.slopeCategory, true);
  const soilData = getSoilAvailableWater(survey.soilTexture);

  const totalCycleMins = zones.reduce((acc, curr) => acc + curr.operatingTimeMinPerDay, 0);
  const totalCycleHours = Number((totalCycleMins / 60).toFixed(1));
  const isWithinWindow = totalCycleHours <= survey.waterWindowHoursPerDay;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100/70 text-blue-800 flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  Rain Bird Manual Standards
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500">Hydraulic Analysis & Runtimes</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                Irrigation Hydraulic Schedule & Operating Runtime Planner
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Schedule to Excel</span>
            </button>
          </div>
        </div>

        {/* Rain Bird 3-Rule Flow Determination Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
            <div className="flex items-center justify-between text-2xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
              <span>Rule 1: 10% Meter Loss</span>
              <Gauge className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {safeCap.rule1FlowM3h} m³/h
            </span>
            <span className="text-2xs text-slate-500 block font-mono">
              {(safeCap.rule1FlowM3h * 4.403).toFixed(1)} GPM limit
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
            <div className="flex items-center justify-between text-2xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
              <span>Rule 2: 75% Safe Meter</span>
              <Gauge className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {safeCap.rule2FlowM3h} m³/h
            </span>
            <span className="text-2xs text-slate-500 block font-mono">
              {(safeCap.rule2FlowM3h * 4.403).toFixed(1)} GPM limit
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
            <div className="flex items-center justify-between text-2xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
              <span>Rule 3: Pipe Velocity</span>
              <Gauge className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {safeCap.rule3FlowM3h} m³/h
            </span>
            <span className="text-2xs text-slate-500 block font-mono">
              {(safeCap.rule3FlowM3h * 4.403).toFixed(1)} GPM (≤ 2.0 m/s)
            </span>
          </div>

          <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between text-2xs text-blue-900 font-bold uppercase tracking-wider mb-1">
              <span>Governing Design Flow</span>
              <ShieldCheck className="w-4 h-4 text-blue-700" />
            </div>
            <span className="text-xl font-extrabold font-mono text-blue-900 tabular-nums">
              {safeCap.governingFlowM3h} m³/h
            </span>
            <span className="text-2xs text-blue-700 font-medium block">
              {(safeCap.governingFlowM3h * 4.403).toFixed(1)} GPM max per valve
            </span>
          </div>
        </div>

        {/* Governing Rule Banner */}
        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Hydraulic Sizing Constraint:</strong> {safeCap.governingRule}. Static pressure at POC is{' '}
              <strong>{survey.staticPressureBar} bar ({(survey.staticPressureBar * 14.5038).toFixed(1)} psi)</strong> with{' '}
              {survey.waterMeterSizeInch}" meter and {survey.serviceLineSizeMm}mm service pipe.
            </span>
          </div>
        </div>
      </div>

      {/* Valve Circuit Runtimes Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Zone Valve Circuits & Runtime Calculations
            </h2>
            <p className="text-xs text-slate-500">
              Calculated using Rain Bird Operating Time Formula: <code className="font-mono text-slate-700">OT = (I × 60) / (PR × DA)</code>
            </p>
          </div>

          {/* Water Window Indicator */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium ${
              isWithinWindow
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {isWithinWindow ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            )}
            <span>
              Total Cycle: <strong>{totalCycleMins} mins ({totalCycleHours} hrs)</strong> / Available Window: <strong>{survey.waterWindowHoursPerDay} hrs</strong>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 select-none">
                <th className="py-3 px-3 w-16">Zone</th>
                <th className="py-3 px-3 min-w-[160px]">Circuit Description</th>
                <th className="py-3 px-3 w-20 text-right">Area (m²)</th>
                <th className="py-3 px-3 min-w-[220px]">Rain Bird Hardware</th>
                <th className="py-3 px-3 w-20 text-center">Heads/Emitters</th>
                <th className="py-3 px-3 w-24 text-right">Flow (m³/h)</th>
                <th className="py-3 px-3 w-24 text-right">Flow (GPM)</th>
                <th className="py-3 px-3 w-28 text-right">Precip. Rate (mm/h)</th>
                <th className="py-3 px-3 w-24 text-right">Weekly Req (mm)</th>
                <th className="py-3 px-3 w-28 text-right font-bold text-blue-900">Runtime (min/cycle)</th>
                <th className="py-3 px-3 w-32">Control Valve</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {zones.map((z) => {
                const exceedsSoilPR = z.precipitationRateMmH > maxSoilPR && z.plantType.includes('Spray');
                return (
                  <tr key={z.zoneNumber} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-700">
                      Z-{String(z.zoneNumber).padStart(2, '0')}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-900">
                      {z.zoneName}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      {z.areaM2} m²
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {z.emitterType}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-semibold text-slate-800">
                      {z.emitterCount}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      {z.flowM3h}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-500 tabular-nums">
                      {z.flowGpm}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      <span className={exceedsSoilPR ? 'text-amber-700 font-bold' : 'text-slate-800'}>
                        {z.precipitationRateMmH} mm/h
                      </span>
                      {exceedsSoilPR && (
                        <span className="block text-3xs text-amber-600 font-sans">
                          (Exceeds {maxSoilPR}mm/h intake)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600 tabular-nums">
                      {z.requiredWaterMmPerWeek} mm
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-extrabold text-blue-700 text-sm tabular-nums bg-blue-50/40">
                      {z.operatingTimeMinPerDay} min
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-mono text-2xs">
                      {z.valveSize}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Technical Reference Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Rain Bird Engineering Best Practices (from attached Manual):</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-600 text-2xs sm:text-xs">
            <li>
              <strong>Don't Mix Emitter Types on Same Valve (Page 35, Fig 24):</strong> Turf spray heads, rotors, bubblers, and driplines operate at vastly different precipitation rates. TerraFlora assigns dedicated valves for each planting group.
            </li>
            <li>
              <strong>Water Window Planning (Page 59):</strong> Watering is scheduled between 10:00 PM and 5:00 AM to eliminate wind drift and evaporation loss while minimizing fungal risk on turf foliage.
            </li>
            <li>
              <strong>Slope Infiltration Limits (Page 21 & 118):</strong> USDA maximum application rate for {survey.soilTexture.replace('_', ' ')} on {survey.slopeCategory.replace('_', ' ')} is {maxSoilPR} mm/h. If precipitation rate exceeds this, use controller cycle-and-soak feature.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
