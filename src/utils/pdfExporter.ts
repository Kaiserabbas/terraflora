import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type {
  BOQItem,
  BOQSummary,
  SiteSurveyData,
  IrrigationZoneCalc,
} from '../types/landscape.ts';

// Safe currency formatter for PDF (avoiding non-ASCII font encoding issues in jsPDF)
function formatPdfCurrency(amount: number, currency: string): string {
  const code = currency || 'AED';
  return `${code} ${Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function exportProjectToPDF(
  survey: SiteSurveyData,
  boqItems: BOQItem[],
  boqSummary: BOQSummary,
  zones: IrrigationZoneCalc[]
): { success: boolean; filename: string } {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryColor: [number, number, number] = [16, 120, 72]; // Emerald #107848
    const darkTextColor: [number, number, number] = [30, 41, 59]; // Slate #1E293B

    // Helper for table execution
    const runAutoTable = typeof autoTable === 'function' ? autoTable : (autoTable as any).default || (autoTable as any).autoTable;

    // ==========================================
    // PAGE 1: COVER & EXECUTIVE SUMMARY
    // ==========================================
    // Top banner bar
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 16, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TERRAFLORA · LANDSCAPE ARCHITECTURE & IRRIGATION CONTRACTORS', 14, 10.5);

    // Title & Reference
    doc.setTextColor(...darkTextColor);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Landscape & Irrigation Commercial Proposal', 14, 28);

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Official Quotation & Detailed Bill of Quantities (BOQ) · Ref: ${survey.projectNumber || 'TF-PROPOSAL'}`, 14, 34);

    // Client & Project Profile Box
    runAutoTable(doc, {
      startY: 38,
      theme: 'grid',
      head: [['PROJECT SPECIFICATION', 'CLIENT & SITE DETAILS']],
      body: [
        [
          `Project Name: ${survey.projectName}\nProject Code: ${survey.projectNumber}\nClassification: ${survey.projectType.replace('_', ' ').toUpperCase()}\nSurvey Date: ${survey.surveyDate}\nArchitect / Surveyor: ${survey.surveyorName}\nCurrency: ${survey.currency}`,
          `Client Name: ${survey.clientName}\nContact Phone: ${survey.clientPhone}\nContact Email: ${survey.clientEmail}\nSite Address: ${survey.siteAddress}\nExecution Timeline: ${survey.targetTimelineWeeks} Calendar Weeks\nValidity: 30 Days from Survey Date`,
        ],
      ],
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: darkTextColor,
        lineColor: [226, 232, 240],
      },
      styles: { cellPadding: 3.5 },
    });

    // Measured Site Scope Table
    const currentYAfterProfile = (doc as any).lastAutoTable.finalY + 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...primaryColor);
    doc.text('1. Measured Landscape Scope & Site Area Breakdown', 14, currentYAfterProfile);

    runAutoTable(doc, {
      startY: currentYAfterProfile + 3,
      theme: 'striped',
      head: [['Zone / Area Description', 'Measured Area', 'Technical Specification / Finish']],
      body: [
        ['Total Landscape Footprint', `${survey.totalLandscapeAreaM2} m²`, '100% of contract works (Softscape + Hardscape)'],
        ['Lawn Turfgrass Area', `${survey.turfAreaM2} m²`, `${survey.turfPreference.selectedType} (${survey.turfPreference.installationMethod.replace('_', ' ')})`],
        ['Planting Beds & Shrubbery', `${survey.plantingBedsAreaM2} m²`, 'Enriched sweet sand topsoil, 20% organic compost mix, geotextile barrier'],
        ['Hardscape, Paving & Patios', `${survey.hardscapeAreaM2} m²`, 'Porcelain pavers / natural travertine / interlocking stones & lawn edging'],
        ['Perimeter Boundary Hedge', `${survey.shrubPreferences.hedgeLengthLm} Lm`, `${survey.shrubPreferences.hedgeHeightCategory.replace('_', ' ')} (Bougainvillea / Conocarpus / Buxus)`],
        ['Specimen Trees & Palms', `${(survey.treePreferences.shadeTreeCount + survey.treePreferences.palmTreeCount + survey.treePreferences.fruitTreeCount)} Nos`, 'Double lodge timber staking, deep root bubblers, organic mulch rings'],
      ],
      headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontSize: 8 },
      bodyStyles: { fontSize: 7.5, textColor: darkTextColor },
      styles: { cellPadding: 2.2 },
    });

    // Financial Cost Summary Table
    const currentYAfterScope = (doc as any).lastAutoTable.finalY + 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...primaryColor);
    doc.text('2. Executive Cost Summary by Division', 14, currentYAfterScope);

    runAutoTable(doc, {
      startY: currentYAfterScope + 3,
      theme: 'grid',
      head: [['Div.', 'Work Section Description', `Amount (${survey.currency})`]],
      body: [
        ['Sec A', 'Site Preliminaries, Excavation, Grading & Topsoil Mix', formatPdfCurrency(boqSummary.sectionSubtotals.A_PREP || 0, survey.currency)],
        ['Sec B', 'Softscaping & Plant Material (Turf, Shrubs, Trees, Palms & Mulch)', formatPdfCurrency(boqSummary.sectionSubtotals.B_SOFTSCAPE || 0, survey.currency)],
        ['Sec C', 'Rain Bird Automatic Irrigation (Valves, Sprinklers, Dripline, Smart Controller)', formatPdfCurrency(boqSummary.sectionSubtotals.C_IRRIGATION || 0, survey.currency)],
        ['Sec D', 'Hardscaping & Outdoor Living (Umbrellas, Benches, Sofas, Paving & Edging)', formatPdfCurrency(boqSummary.sectionSubtotals.D_HARDSCAPE || 0, survey.currency)],
        ['Sec E', 'Skilled Horticultural Labor, Hydrostatic Testing & Commissioning', formatPdfCurrency(boqSummary.sectionSubtotals.E_LABOR || 0, survey.currency)],
        ['Sec F', '90-Day Post-Planting Establishment Care & Full Living Plant Warranty', formatPdfCurrency(boqSummary.sectionSubtotals.F_MAINTENANCE || 0, survey.currency)],
        ['', 'Total Direct Works Cost', formatPdfCurrency(boqSummary.directCostTotal, survey.currency)],
        ['', `Contractor Overhead & Profit (${boqSummary.overheadProfitPercent}%)`, formatPdfCurrency(boqSummary.overheadProfitAmount, survey.currency)],
        ['', `Contingency Reserve (${boqSummary.contingencyPercent}%)`, formatPdfCurrency(boqSummary.contingencyAmount, survey.currency)],
        ['', 'Subtotal Before Tax', formatPdfCurrency(boqSummary.subtotalBeforeTax, survey.currency)],
        ['', `VAT / Sales Tax (${boqSummary.taxPercent}%)`, formatPdfCurrency(boqSummary.taxAmount, survey.currency)],
        ['TOTAL', 'TOTAL CONTRACT VALUE (GRAND TOTAL)', formatPdfCurrency(boqSummary.grandTotal, survey.currency)],
      ],
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 7.5, textColor: darkTextColor },
      styles: { cellPadding: 2 },
      didParseCell: (data: any) => {
        if (data.row.index >= 6) {
          data.cell.styles.fontStyle = 'bold';
          if (data.row.index === 11) {
            data.cell.styles.fillColor = [236, 253, 245];
            data.cell.styles.textColor = [6, 95, 70];
          }
        }
      },
    });

    // Client signature block at the bottom of Page 1
    const sigY = (doc as any).lastAutoTable.finalY + 7;
    if (sigY < 270) {
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Submitted by: ${survey.surveyorName} (TerraFlora)`, 14, sigY);
      doc.text('Accepted & Confirmed by Client: ___________________________', 110, sigY);
      doc.text(`Date: ${survey.surveyDate}`, 14, sigY + 4.5);
      doc.text('Date: ________________________', 110, sigY + 4.5);
    }

    // ==========================================
    // PAGE 2: FULL ITEMIZED BILL OF QUANTITIES
    // ==========================================
    doc.addPage();
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`TERRAFLORA · DETAILED BILL OF QUANTITIES · ${survey.projectNumber}`, 14, 8);

    doc.setFontSize(13);
    doc.setTextColor(...darkTextColor);
    doc.text('Detailed Materials & Services Schedule (BOQ)', 14, 20);

    const boqTableBody: (string | number)[][] = [];
    const sectionLabels: Record<string, string> = {
      A_PREP: 'DIVISION A: SITE PRELIMINARIES & PREPARATION',
      B_SOFTSCAPE: 'DIVISION B: SOFTSCAPE & PLANT MATERIAL',
      C_IRRIGATION: 'DIVISION C: RAIN BIRD AUTOMATIC IRRIGATION SYSTEM',
      D_HARDSCAPE: 'DIVISION D: HARDSCAPING, PAVING & OUTDOOR LIVING',
      E_LABOR: 'DIVISION E: LABOR, TESTING & COMMISSIONING',
      F_MAINTENANCE: 'DIVISION F: 90-DAY MAINTENANCE & WARRANTY',
    };

    const allSections = ['A_PREP', 'B_SOFTSCAPE', 'C_IRRIGATION', 'D_HARDSCAPE', 'E_LABOR', 'F_MAINTENANCE'];

    for (const secKey of allSections) {
      const secItems = boqItems.filter((i) => i.section === secKey);
      if (secItems.length === 0) continue;

      // Header row for section
      boqTableBody.push([
        secKey.replace('_', ' '),
        sectionLabels[secKey],
        '',
        '',
        '',
        '',
        formatPdfCurrency(boqSummary.sectionSubtotals[secKey as keyof typeof boqSummary.sectionSubtotals] || 0, survey.currency),
      ]);

      for (const item of secItems) {
        boqTableBody.push([
          item.itemCode,
          `${item.description}\n${item.specification.slice(0, 95)}`,
          item.category,
          item.quantity,
          item.unit,
          item.unitRate,
          formatPdfCurrency(item.quantity * item.unitRate, survey.currency),
        ]);
      }
    }

    runAutoTable(doc, {
      startY: 24,
      theme: 'grid',
      head: [['Item Code', 'Description & Technical Specification', 'Category', 'Qty', 'Unit', `Rate (${survey.currency})`, `Amount (${survey.currency})`]],
      body: boqTableBody,
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
      bodyStyles: { fontSize: 6.8, textColor: darkTextColor, cellPadding: 1.8 },
      columnStyles: {
        0: { cellWidth: 16 },
        1: { cellWidth: 74 },
        2: { cellWidth: 22 },
        3: { cellWidth: 14, halign: 'right' },
        4: { cellWidth: 12, halign: 'center' },
        5: { cellWidth: 20, halign: 'right' },
        6: { cellWidth: 24, halign: 'right' },
      },
      didParseCell: (data: any) => {
        if (data.row.raw && typeof data.row.raw[0] === 'string' && data.row.raw[0].includes('DIVISION')) {
          data.cell.styles.fillColor = [241, 245, 249];
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });

    // ==========================================
    // PAGE 3: BOTANICAL SCHEDULE & RAIN BIRD HYDRAULICS
    // ==========================================
    doc.addPage();
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`TERRAFLORA · PLANT SCHEDULE & IRRIGATION HYDRAULICS · ${survey.projectNumber}`, 14, 8);

    doc.setFontSize(12);
    doc.setTextColor(...darkTextColor);
    doc.text('3. Botanical Plant Schedule & Nursery Standards', 14, 20);

    const softItems = boqItems.filter((i) => i.section === 'B_SOFTSCAPE');
    const plantTableBody: (string | number)[][] = softItems.map((item) => [
      item.category,
      item.description.split(' - ')[0] || item.description,
      item.description.includes(' - ') ? item.description.split(' - ')[1] : item.category,
      item.specification.slice(0, 50),
      `${item.quantity} ${item.unit}`,
      'greensouq.ae / Nursery',
    ]);

    if (plantTableBody.length === 0) {
      plantTableBody.push(
        ['Turf', survey.turfPreference.selectedType, 'Cynodon / Paspalum', 'Certified 25mm sod rolls', `${survey.turfAreaM2} m²`, 'Desert Turf'],
        ['Hedge', 'Perimeter Privacy Hedge', 'Bougainvillea / Conocarpus', '5L Container, 60-80cm', `${survey.shrubPreferences.hedgeLengthLm * 2} Nos`, 'greensouq.ae'],
        ['Trees', 'Canopy Shade Trees', 'Delonix regia / Neem', 'Caliper 12cm, height 3m', `${survey.treePreferences.shadeTreeCount} Nos`, 'greensouq.ae']
      );
    }

    runAutoTable(doc, {
      startY: 24,
      theme: 'striped',
      head: [['Category', 'Common Name', 'Botanical Name', 'Container / Spec Size', 'Qty / Area', 'Benchmark Source']],
      body: plantTableBody,
      headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontSize: 7.5 },
      bodyStyles: { fontSize: 7, textColor: darkTextColor, cellPadding: 1.8 },
    });

    // Rain Bird Hydraulics Table
    const currentYAfterPlant = (doc as any).lastAutoTable.finalY + 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('4. Rain Bird Irrigation Hydraulic Schedule', 14, currentYAfterPlant);

    const zoneRows = zones.map((z) => [
      `Zone ${z.zoneNumber}`,
      z.zoneName,
      `${z.areaM2} m²`,
      z.emitterType,
      z.emitterCount,
      `${z.flowM3h} m³/h`,
      `${z.flowGpm} GPM`,
      `${z.precipitationRateMmH} mm/h`,
      `${z.operatingTimeMinPerDay} min`,
      z.valveSize,
    ]);

    runAutoTable(doc, {
      startY: currentYAfterPlant + 3,
      theme: 'grid',
      head: [['Zone', 'Circuit Description', 'Area', 'Hardware Specified', 'Count', 'Flow (m³/h)', 'Flow (GPM)', 'Precip. Rate', 'Runtime', 'Valve']],
      body: zoneRows,
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontSize: 7 },
      bodyStyles: { fontSize: 6.8, textColor: darkTextColor, cellPadding: 1.8 },
    });

    // Save the PDF with fallback for iframe sandboxes
    const safeTitle = (survey.projectName || 'TerraFlora_Landscape').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${safeTitle}_Official_BOQ_Proposal.pdf`;

    try {
      doc.save(filename);
    } catch {
      // In sandboxed iframe, fallback to blob URL download
      const blob = doc.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(blobUrl);
      }, 1000);
    }

    return { success: true, filename };
  } catch (err) {
    console.error('PDF Export Error:', err);
    return { success: false, filename: '' };
  }
}
