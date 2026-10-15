import React from 'react';
import {
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  Trees,
  ShieldCheck,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
} from 'lucide-react';
import type {
  BOQItem,
  BOQSummary,
  SiteSurveyData,
  IrrigationZoneCalc,
} from '../types/landscape.ts';
import {
  formatCurrencyValue,
} from '../utils/calculations.ts';

interface ProposalPreviewProps {
  survey: SiteSurveyData;
  boqItems: BOQItem[];
  boqSummary: BOQSummary;
  zones: IrrigationZoneCalc[];
  onPrint: () => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
}

export const ProposalPreview: React.FC<ProposalPreviewProps> = ({
  survey,
  boqItems,
  boqSummary,
  zones,
  onPrint,
  onExportPDF,
  onExportExcel,
}) => {
  return (
    <div className="space-y-6">
      {/* Action Bar (Hidden in Print) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-bold text-slate-800">
            Official Landscaping & Irrigation Proposal Document
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onExportPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>Download Official PDF (.pdf)</span>
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Browser Print</span>
          </button>

          <button
            type="button"
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Official Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Formal Paper Proposal Container */}
      <div className="bg-white rounded-2xl border border-slate-300 p-8 sm:p-12 shadow-sm max-w-4xl mx-auto space-y-8 text-slate-900 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b-2 border-emerald-700 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
                <Trees className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  TerraFlora
                </h1>
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-widest">
                  Landscape Architecture & Irrigation Engineers
                </p>
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500 space-y-0.5">
              <p>Specialists in Residential Villas, Commercial Turf & Rain Bird Automation</p>
              <p>Email: kahfgreens@gmail.com · Web: www.terraflora-contractors.com</p>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6 space-y-1 text-xs">
            <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded block text-right">
              {survey.projectNumber}
            </span>
            <p className="text-slate-500">Date: <strong className="text-slate-800">{survey.surveyDate}</strong></p>
            <p className="text-slate-500">Validity: <strong className="text-slate-800">30 Calendar Days</strong></p>
            <p className="text-slate-500">Architect: <strong className="text-slate-800">{survey.surveyorName}</strong></p>
          </div>
        </div>

        {/* Project & Client Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Client Details
            </span>
            <p className="text-sm font-bold text-slate-900">{survey.clientName}</p>
            <p className="text-slate-600 mt-0.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{survey.siteAddress}</span>
            </p>
            <p className="text-slate-600 mt-0.5 flex items-center gap-1.5 font-mono">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{survey.clientPhone}</span>
            </p>
            <p className="text-slate-600 mt-0.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{survey.clientEmail}</span>
            </p>
          </div>

          <div>
            <span className="font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Project Scope & Site Profile
            </span>
            <p className="text-sm font-bold text-slate-900">{survey.projectName}</p>
            <div className="mt-1 space-y-0.5 text-slate-600">
              <p>Project Type: <span className="capitalize">{survey.projectType.replace('_', ' ')}</span></p>
              <p>Total Landscape Area: <strong>{survey.totalLandscapeAreaM2} m²</strong> (Lawn: {survey.turfAreaM2} m² · Beds: {survey.plantingBedsAreaM2} m²)</p>
              <p>Turf Variety: <strong>{survey.turfPreference.selectedType}</strong></p>
              <p>Target Timeline: <strong>{survey.targetTimelineWeeks} Weeks</strong></p>
            </div>
          </div>
        </div>

        {/* Plantation & Technical Specifications Summary */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
            1. Scope of Softscaping & Plant Materials
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
              <span className="font-semibold text-slate-900 block">Lawn & Grass:</span>
              <p>{survey.turfAreaM2} m² of {survey.turfPreference.selectedType} ({survey.turfPreference.installationMethod.replace('_', ' ')})</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
              <span className="font-semibold text-slate-900 block">Perimeter Hedges:</span>
              <p>{survey.shrubPreferences.hedgeLengthLm} linear meters ({survey.shrubPreferences.hedgeHeightCategory.replace('_', ' ')})</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
              <span className="font-semibold text-slate-900 block">Specimen Trees & Palms:</span>
              <p>{survey.treePreferences.shadeTreeCount} Shade Trees · {survey.treePreferences.palmTreeCount} Palms · {survey.treePreferences.fruitTreeCount} Fruit Trees with double lodge staking</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
              <span className="font-semibold text-slate-900 block">Groundcovers & Mulch:</span>
              <p>{survey.groundCoverPreferences.areaM2} m² groundcovers with {survey.groundCoverPreferences.mulchType.replace('_', ' ')} ({survey.groundCoverPreferences.mulchDepthCm}cm depth)</p>
            </div>
          </div>
        </div>

        {/* Irrigation System Hydraulic Summary */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
            2. Rain Bird Automatic Irrigation Engineering
          </h2>
          <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-200/80 text-xs space-y-2">
            <p className="text-slate-700">
              Complete automated underground irrigation system compliant with <strong>Rain Bird Design Manual standards</strong>. Sized for {survey.staticPressureBar} bar static pressure at {survey.waterMeterSizeInch}" water meter.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-2xs text-slate-700">
              <div>Zones: <strong>{zones.length} Remote Valves</strong></div>
              <div>Sprinklers: <strong>Rain Bird 1804 / HE-VAN</strong></div>
              <div>Dripline: <strong>Rain Bird XFD 16mm</strong></div>
              <div>Smart Controller: <strong>ESP-TM2 / ESP-Me WiFi</strong></div>
            </div>
          </div>
        </div>

        {/* BOQ Financial Schedule */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
            3. Summary of Bill of Quantities (BOQ)
          </h2>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300">
                <th className="py-2.5 px-3">Div.</th>
                <th className="py-2.5 px-3">Work Section Description</th>
                <th className="py-2.5 px-3 text-right">Subtotal Amount ({survey.currency})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              <tr>
                <td className="py-2 px-3 font-mono">Sec A</td>
                <td className="py-2 px-3">Site Preliminaries, Excavation, Grading & Topsoil Mix</td>
                <td className="py-2 px-3 text-right font-mono tabular-nums">{formatCurrencyValue(boqSummary.sectionSubtotals.A_PREP || 0, survey.currency)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono">Sec B</td>
                <td className="py-2 px-3">Softscaping (Turf Grass Sod, Hedges, Shrubs, Trees & Mulch)</td>
                <td className="py-2 px-3 text-right font-mono tabular-nums">{formatCurrencyValue(boqSummary.sectionSubtotals.B_SOFTSCAPE || 0, survey.currency)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono">Sec C</td>
                <td className="py-2 px-3">Rain Bird Automatic Irrigation (Valves, Sprinklers, Dripline, Controller)</td>
                <td className="py-2 px-3 text-right font-mono tabular-nums">{formatCurrencyValue(boqSummary.sectionSubtotals.C_IRRIGATION || 0, survey.currency)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono">Sec D</td>
                <td className="py-2 px-3">Hardscaping, Lawn Edging & Stepping Pathways</td>
                <td className="py-2 px-3 text-right font-mono tabular-nums">{formatCurrencyValue(boqSummary.sectionSubtotals.D_HARDSCAPE || 0, survey.currency)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono">Sec E</td>
                <td className="py-2 px-3">Horticultural Labor, Hydrostatic Testing & Commissioning</td>
                <td className="py-2 px-3 text-right font-mono tabular-nums">{formatCurrencyValue(boqSummary.sectionSubtotals.E_LABOR || 0, survey.currency)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono">Sec F</td>
                <td className="py-2 px-3">90-Day Post-Planting Establishment Care & Plant Warranty</td>
                <td className="py-2 px-3 text-right font-mono tabular-nums">{formatCurrencyValue(boqSummary.sectionSubtotals.F_MAINTENANCE || 0, survey.currency)}</td>
              </tr>

              {/* Subtotals & Grand Total */}
              <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                <td colSpan={2} className="py-2.5 px-3 text-right text-slate-700">Total Direct Works Cost:</td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-900 tabular-nums">{formatCurrencyValue(boqSummary.directCostTotal, survey.currency)}</td>
              </tr>
              <tr className="text-slate-600">
                <td colSpan={2} className="py-1.5 px-3 text-right">Contractor Overhead & Profit ({boqSummary.overheadProfitPercent}%):</td>
                <td className="py-1.5 px-3 text-right font-mono tabular-nums">{formatCurrencyValue(boqSummary.overheadProfitAmount, survey.currency)}</td>
              </tr>
              <tr className="text-slate-600">
                <td colSpan={2} className="py-1.5 px-3 text-right">Contingency Reserve ({boqSummary.contingencyPercent}%):</td>
                <td className="py-1.5 px-3 text-right font-mono tabular-nums">{formatCurrencyValue(boqSummary.contingencyAmount, survey.currency)}</td>
              </tr>
              <tr className="text-slate-700 font-semibold border-t border-slate-200">
                <td colSpan={2} className="py-1.5 px-3 text-right">Subtotal (Excl. Tax):</td>
                <td className="py-1.5 px-3 text-right font-mono tabular-nums">{formatCurrencyValue(boqSummary.subtotalBeforeTax, survey.currency)}</td>
              </tr>
              <tr className="text-slate-600">
                <td colSpan={2} className="py-1.5 px-3 text-right">Applicable Sales Tax / VAT ({boqSummary.taxPercent}%):</td>
                <td className="py-1.5 px-3 text-right font-mono tabular-nums">{formatCurrencyValue(boqSummary.taxAmount, survey.currency)}</td>
              </tr>
              <tr className="bg-emerald-50 text-emerald-950 font-extrabold text-sm border-t-2 border-emerald-600">
                <td colSpan={2} className="py-3 px-3 text-right">TOTAL CONTRACT VALUE (GRAND TOTAL):</td>
                <td className="py-3 px-3 text-right font-mono text-emerald-800 tabular-nums text-base">{formatCurrencyValue(boqSummary.grandTotal, survey.currency)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Commercial Payment Terms & Warranty */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
          <span className="font-bold text-slate-900 block">Payment Milestones & Warranty:</span>
          <p>1. <strong>40% Advance Payment</strong> on contract signing & procurement mobilization.</p>
          <p>2. <strong>40% Interim Payment</strong> upon completion of piping, grading, and delivery of specimen trees & sod rolls.</p>
          <p>3. <strong>20% Final Handover Payment</strong> upon successful 2-hour hydrostatic testing, sprinkler commissioning & client signoff.</p>
          <p>4. <strong>Warranty:</strong> All living plants guaranteed for 90 days. Rain Bird valves and smart controller warranted for 24 months manufacturer warranty.</p>
        </div>

        {/* Client Acceptance Signature Block */}
        <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs">
          <div>
            <span className="font-bold uppercase tracking-wider text-slate-500 block mb-8">
              Submitted by (Contractor):
            </span>
            <div className="border-t border-slate-400 pt-2 space-y-0.5">
              <p className="font-bold text-slate-900">Engr. M. Kahf</p>
              <p className="text-slate-500">Lead Landscape Architect, TerraFlora</p>
              <p className="text-slate-400">Date: {survey.surveyDate}</p>
            </div>
          </div>

          <div>
            <span className="font-bold uppercase tracking-wider text-slate-500 block mb-8">
              Accepted & Approved by (Client):
            </span>
            <div className="border-t border-slate-400 pt-2 space-y-0.5">
              <p className="font-bold text-slate-900">{survey.clientName}</p>
              <p className="text-slate-500">Authorized Signature</p>
              <p className="text-slate-400">Date: ________________________</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
