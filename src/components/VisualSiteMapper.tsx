import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  MapPin,
  Move,
  Layers,
  Droplets,
  Activity,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Download,
  Info,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Maximize2,
  Grid,
  Zap,
  Gauge,
  Sparkles,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import type { SiteSurveyData, IrrigationZoneCalc, PlacedZone, SiteLayoutConfig } from '../types/landscape.ts';
import {
  DEFAULT_SITE_PRESETS,
  ZONE_COLOR_PALETTES,
  initializePlacedZones,
} from '../utils/siteLayoutPresets.ts';
import {
  calculateSafeWaterCapacityRules,
  getMaxPrecipitationRate,
} from '../utils/calculations.ts';

interface VisualSiteMapperProps {
  survey: SiteSurveyData;
  zones: IrrigationZoneCalc[];
  placedZones: PlacedZone[];
  onUpdatePlacedZones: (zones: PlacedZone[]) => void;
  siteConfig: SiteLayoutConfig;
  onUpdateSiteConfig: (config: SiteLayoutConfig) => void;
  onExportSchedule: () => void;
}

export const VisualSiteMapper: React.FC<VisualSiteMapperProps> = ({
  survey,
  zones,
  placedZones,
  onUpdatePlacedZones,
  siteConfig,
  onUpdateSiteConfig,
  onExportSchedule,
}) => {
  // SVG Canvas reference for PNG export
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Selected zone for inspector & fine tuning
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(
    placedZones.length > 0 ? placedZones[0].id : null
  );

  // Dragging states
  const [draggingItem, setDraggingItem] = useState<{
    type: 'zone' | 'poc' | 'controller';
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // Layer visibility toggles
  const [showMainline, setShowMainline] = useState<boolean>(true);
  const [showLaterals, setShowLaterals] = useState<boolean>(true);
  const [showSprayRadius, setShowSprayRadius] = useState<boolean>(true);
  const [showHeads, setShowHeads] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);

  // Simulation mode
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeSimulationZoneIndex, setActiveSimulationZoneIndex] = useState<number>(0);
  const [simStepSec, setSimStepSec] = useState<number>(0);

  // Zoom & Viewport scale (pixels per meter)
  const [scale, setScale] = useState<number>(34); // ~34px per meter

  // Hydraulic Capacity Governing Limit
  const safeCap = useMemo(() => {
    return calculateSafeWaterCapacityRules(
      survey.staticPressureBar || 4.5,
      survey.waterMeterSizeInch || '1',
      survey.serviceLineSizeMm || 25
    );
  }, [survey.staticPressureBar, survey.waterMeterSizeInch, survey.serviceLineSizeMm]);

  // Max soil precipitation rate before runoff
  const maxSoilPR = useMemo(() => {
    return getMaxPrecipitationRate(survey.soilTexture, survey.slopeCategory, true);
  }, [survey.soilTexture, survey.slopeCategory]);

  // Current placed zones
  const placedList = useMemo(() => placedZones.filter((z) => z.isPlaced), [placedZones]);
  const unplacedList = useMemo(() => placedZones.filter((z) => !z.isPlaced), [placedZones]);

  // Total Placed Flow
  const totalPlacedFlowM3h = useMemo(() => {
    return Number(placedList.reduce((acc, curr) => acc + curr.flowM3h, 0).toFixed(2));
  }, [placedList]);

  // Active Zone in Simulation
  const activeSimZone = useMemo(() => {
    if (!isSimulating || placedList.length === 0) return null;
    return placedList[activeSimulationZoneIndex % placedList.length];
  }, [isSimulating, placedList, activeSimulationZoneIndex]);

  // Simulation timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSimulating && placedList.length > 0) {
      interval = setInterval(() => {
        setSimStepSec((prev) => {
          if (prev >= 6) {
            setActiveSimulationZoneIndex((prevIdx) => (prevIdx + 1) % placedList.length);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setSimStepSec(0);
    }
    return () => clearInterval(interval);
  }, [isSimulating, placedList]);

  // Canvas size in pixels
  const canvasWidthPx = siteConfig.siteWidthM * scale;
  const canvasHeightPx = siteConfig.siteLengthM * scale;

  // Convert SVG coordinates to meters
  const getCoordinatesInMeters = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const rawX = (clientX - rect.left) / scale;
    const rawY = (clientY - rect.top) / scale;

    let x = Math.max(0, Math.min(siteConfig.siteWidthM, rawX));
    let y = Math.max(0, Math.min(siteConfig.siteLengthM, rawY));

    if (snapToGrid) {
      x = Math.round(x * 2) / 2; // snap to 0.5m
      y = Math.round(y * 2) / 2;
    } else {
      x = Number(x.toFixed(1));
      y = Number(y.toFixed(1));
    }
    return { x, y };
  };

  // Mouse / Pointer Drag Handlers
  const handlePointerDownZone = (e: React.PointerEvent, zoneId: string) => {
    e.stopPropagation();
    const zone = placedZones.find((z) => z.id === zoneId);
    if (!zone) return;

    setSelectedZoneId(zoneId);
    const coords = getCoordinatesInMeters(e.clientX, e.clientY);
    setDraggingItem({
      type: 'zone',
      id: zoneId,
      offsetX: coords.x - zone.x,
      offsetY: coords.y - zone.y,
    });
  };

  const handlePointerDownPOC = (e: React.PointerEvent) => {
    e.stopPropagation();
    const coords = getCoordinatesInMeters(e.clientX, e.clientY);
    setDraggingItem({
      type: 'poc',
      id: 'poc',
      offsetX: coords.x - siteConfig.pocLocation.x,
      offsetY: coords.y - siteConfig.pocLocation.y,
    });
  };

  const handlePointerDownController = (e: React.PointerEvent) => {
    e.stopPropagation();
    const coords = getCoordinatesInMeters(e.clientX, e.clientY);
    setDraggingItem({
      type: 'controller',
      id: 'controller',
      offsetX: coords.x - siteConfig.controllerLocation.x,
      offsetY: coords.y - siteConfig.controllerLocation.y,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingItem) return;

    const coords = getCoordinatesInMeters(e.clientX, e.clientY);

    if (draggingItem.type === 'zone') {
      const zone = placedZones.find((z) => z.id === draggingItem.id);
      if (!zone) return;

      let newX = coords.x - draggingItem.offsetX;
      let newY = coords.y - draggingItem.offsetY;

      // Keep within site bounds
      newX = Math.max(0, Math.min(siteConfig.siteWidthM - zone.widthM, newX));
      newY = Math.max(0, Math.min(siteConfig.siteLengthM - zone.heightM, newY));

      if (snapToGrid) {
        newX = Math.round(newX * 2) / 2;
        newY = Math.round(newY * 2) / 2;
      }

      onUpdatePlacedZones(
        placedZones.map((z) =>
          z.id === draggingItem.id
            ? {
                ...z,
                x: Number(newX.toFixed(1)),
                y: Number(newY.toFixed(1)),
                valveLocation: {
                  x: Number((newX + 0.5).toFixed(1)),
                  y: Number((newY + 0.5).toFixed(1)),
                },
              }
            : z
        )
      );
    } else if (draggingItem.type === 'poc') {
      let newX = Math.max(0, Math.min(siteConfig.siteWidthM, coords.x - draggingItem.offsetX));
      let newY = Math.max(0, Math.min(siteConfig.siteLengthM, coords.y - draggingItem.offsetY));
      if (snapToGrid) {
        newX = Math.round(newX * 2) / 2;
        newY = Math.round(newY * 2) / 2;
      }
      onUpdateSiteConfig({
        ...siteConfig,
        pocLocation: {
          ...siteConfig.pocLocation,
          x: Number(newX.toFixed(1)),
          y: Number(newY.toFixed(1)),
        },
      });
    } else if (draggingItem.type === 'controller') {
      let newX = Math.max(0, Math.min(siteConfig.siteWidthM, coords.x - draggingItem.offsetX));
      let newY = Math.max(0, Math.min(siteConfig.siteLengthM, coords.y - draggingItem.offsetY));
      if (snapToGrid) {
        newX = Math.round(newX * 2) / 2;
        newY = Math.round(newY * 2) / 2;
      }
      onUpdateSiteConfig({
        ...siteConfig,
        controllerLocation: {
          ...siteConfig.controllerLocation,
          x: Number(newX.toFixed(1)),
          y: Number(newY.toFixed(1)),
        },
      });
    }
  };

  const handlePointerUp = () => {
    setDraggingItem(null);
  };

  // Drop an unplaced zone onto canvas
  const handleDropUnplacedZone = (zoneId: string) => {
    const zone = placedZones.find((z) => z.id === zoneId);
    if (!zone) return;

    // Place in center or open slot
    const targetX = Math.min(siteConfig.siteWidthM - zone.widthM, 2 + (zone.zoneNumber * 2));
    const targetY = Math.min(siteConfig.siteLengthM - zone.heightM, 2 + (zone.zoneNumber * 1.5));

    onUpdatePlacedZones(
      placedZones.map((z) =>
        z.id === zoneId
          ? {
              ...z,
              isPlaced: true,
              x: Math.max(0, targetX),
              y: Math.max(0, targetY),
              valveLocation: { x: targetX + 0.5, y: targetY + 0.5 },
            }
          : z
      )
    );
    setSelectedZoneId(zoneId);
  };

  // Remove zone from canvas (send back to toolbox)
  const handleUnplaceZone = (zoneId: string) => {
    onUpdatePlacedZones(
      placedZones.map((z) => (z.id === zoneId ? { ...z, isPlaced: false } : z))
    );
    if (selectedZoneId === zoneId) {
      setSelectedZoneId(null);
    }
  };

  // Auto-arrange all zones logically
  const handleAutoArrange = () => {
    const reinitialized = initializePlacedZones(zones, siteConfig);
    onUpdatePlacedZones(reinitialized);
    if (reinitialized.length > 0) {
      setSelectedZoneId(reinitialized[0].id);
    }
  };

  // Apply Site Preset
  const handleApplySitePreset = (presetKey: string) => {
    const preset = DEFAULT_SITE_PRESETS[presetKey];
    if (!preset) return;
    onUpdateSiteConfig(preset.config);
    const reinitialized = initializePlacedZones(zones, preset.config);
    onUpdatePlacedZones(reinitialized);
  };

  // Update selected zone dimensions or properties
  const handleUpdateZoneDimension = (widthM: number, heightM: number) => {
    if (!selectedZoneId) return;
    onUpdatePlacedZones(
      placedZones.map((z) => {
        if (z.id !== selectedZoneId) return z;
        const validW = Math.max(1, Math.min(siteConfig.siteWidthM - z.x, widthM));
        const validH = Math.max(1, Math.min(siteConfig.siteLengthM - z.y, heightM));
        return {
          ...z,
          widthM: validW,
          heightM: validH,
          areaM2: Math.round(validW * validH),
        };
      })
    );
  };

  // Update zone color
  const handleUpdateZoneColor = (color: string) => {
    if (!selectedZoneId) return;
    onUpdatePlacedZones(
      placedZones.map((z) => (z.id === selectedZoneId ? { ...z, color } : z))
    );
  };

  // High-Resolution PNG Export of the Hydraulic Map
  const handleExportPNG = () => {
    if (!svgRef.current) return;

    try {
      const svgElement = svgRef.current;
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        // Export at 2x retina sharpness
        canvas.width = canvasWidthPx * 2;
        canvas.height = canvasHeightPx * 2;
        const context = canvas.getContext('2d');
        if (!context) return;

        context.fillStyle = '#f8fafc';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.scale(2, 2);
        context.drawImage(image, 0, 0);

        // Watermark & title on schematic export
        context.fillStyle = '#0f172a';
        context.font = 'bold 16px sans-serif';
        context.fillText(
          `${survey.projectName || 'TerraFlora'} - As-Built Irrigation Hydraulic Layout`,
          20,
          30
        );
        context.fillStyle = '#64748b';
        context.font = '11px sans-serif';
        context.fillText(
          `Rain Bird Standards · Site: ${siteConfig.siteWidthM}m × ${siteConfig.siteLengthM}m (${siteConfig.siteWidthM * siteConfig.siteLengthM} m²) · Scale: 1:${Math.round(100 / (scale / 34))}`,
          20,
          48
        );

        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `${(survey.projectName || 'Project').replace(/\s+/g, '_')}_Irrigation_Layout_Plan.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(blobURL);
      };
      image.src = blobURL;
    } catch (err) {
      console.error('PNG export failed', err);
    }
  };

  // Currently selected zone object
  const selectedZone = placedZones.find((z) => z.id === selectedZoneId) || null;

  return (
    <div className="space-y-5">
      {/* Top Banner & Hydraulic Safety Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
              <Grid className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  Visual Site Cad & Hydraulics
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500">Drag & Drop Interactive Layout</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                Irrigation Zone Placement & Hydraulic Network Mapper
              </h1>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Simulation Play/Stop */}
            <button
              type="button"
              onClick={() => setIsSimulating(!isSimulating)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer ${
                isSimulating
                  ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isSimulating ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Simulation (Zone {activeSimZone?.zoneNumber})</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Test Hydraulic Water Flow</span>
                </>
              )}
            </button>

            {/* Auto Arrange */}
            <button
              type="button"
              onClick={handleAutoArrange}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
              title="Automatically arrange zones across logical garden areas"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Auto-Arrange</span>
            </button>

            {/* Export Schematic PNG */}
            <button
              type="button"
              onClick={handleExportPNG}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Layout PNG</span>
            </button>
          </div>
        </div>

        {/* Real-time Hydraulic Constraints Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80">
            <div className="flex items-center justify-between text-2xs text-blue-900 font-bold uppercase tracking-wider mb-1">
              <span>Governing Design Flow Limit</span>
              <Gauge className="w-3.5 h-3.5 text-blue-700" />
            </div>
            <span className="text-lg font-bold font-mono text-blue-900 tabular-nums">
              {safeCap.governingFlowM3h} m³/h
            </span>
            <span className="text-2xs text-blue-700 block font-mono">
              {(safeCap.governingFlowM3h * 4.403).toFixed(1)} GPM max allowed per valve
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-2xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
              <span>Placed Zones Active Flow</span>
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {isSimulating && activeSimZone ? activeSimZone.flowM3h : placedList[0]?.flowM3h || 0} m³/h
            </span>
            <span className="text-2xs text-slate-500 block">
              {isSimulating ? `Active valve: Z-${activeSimZone?.zoneNumber}` : 'Single valve cycle sequence'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-2xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
              <span>Mainline Pipe Sizing</span>
              <Droplets className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {survey.serviceLineSizeMm}mm Class 200
            </span>
            <span className="text-2xs text-slate-500 block font-mono">
              Static: {survey.staticPressureBar} bar ({(survey.staticPressureBar * 14.5).toFixed(0)} psi)
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-2xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
              <span>Layout Coverage</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {placedList.length} of {placedZones.length} Zones
            </span>
            <span className="text-2xs text-slate-500 block">
              {unplacedList.length === 0 ? 'All zones placed on site' : `${unplacedList.length} zone(s) in toolbox`}
            </span>
          </div>
        </div>

        {/* Site Presets Picker */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Site Templates:</span>
            {Object.entries(DEFAULT_SITE_PRESETS).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleApplySitePreset(key)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-lg text-slate-700 font-medium transition-colors cursor-pointer"
              >
                {item.name.split(' (')[0]}
              </button>
            ))}
          </div>

          {/* Quick layer display toggles */}
          <div className="flex items-center gap-3 text-slate-600">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showMainline}
                onChange={(e) => setShowMainline(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Mainline</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showSprayRadius}
                onChange={(e) => setShowSprayRadius(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Coverage Arcs</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={snapToGrid}
                onChange={(e) => setSnapToGrid(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Snap Grid</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Interactive Studio Grid Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Left Side: Interactive SVG Canvas (3 Cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col items-center">
          {/* Canvas Top Bar */}
          <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">
                Site Grid Canvas: {siteConfig.siteWidthM}m (W) × {siteConfig.siteLengthM}m (L)
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500 font-mono">
                {siteConfig.siteWidthM * siteConfig.siteLengthM} m² Total Plot
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xs text-slate-400">Zoom:</span>
              <button
                type="button"
                onClick={() => setScale((s) => Math.max(22, s - 3))}
                className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
              >
                -
              </button>
              <span className="font-mono text-2xs w-8 text-center">{scale}px/m</span>
              <button
                type="button"
                onClick={() => setScale((s) => Math.min(50, s + 3))}
                className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Interactive SVG Drawing Viewport */}
          <div className="w-full overflow-auto max-h-[700px] border border-slate-200 rounded-xl bg-slate-900/5 p-4 flex justify-center items-center select-none">
            <svg
              ref={svgRef}
              width={canvasWidthPx}
              height={canvasHeightPx}
              viewBox={`0 0 ${canvasWidthPx} ${canvasHeightPx}`}
              className="bg-slate-50 shadow-md rounded-lg cursor-crosshair transition-shadow"
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <defs>
                {/* Metric 1m Grid Pattern */}
                <pattern id="grid1m" width={scale} height={scale} patternUnits="userSpaceOnUse">
                  <path
                    d={`M ${scale} 0 L 0 0 0 ${scale}`}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="0.8"
                  />
                </pattern>
                {/* Metric 5m Major Grid Pattern */}
                <pattern id="grid5m" width={scale * 5} height={scale * 5} patternUnits="userSpaceOnUse">
                  <path
                    d={`M ${scale * 5} 0 L 0 0 0 ${scale * 5}`}
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                  />
                </pattern>

                {/* Animated Water Pipe Gradient */}
                <linearGradient id="mainlineFlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="50%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>

                {/* Drip Tubing Pattern */}
                <pattern id="dripTubing" width={scale * 0.5} height={scale * 0.5} patternUnits="userSpaceOnUse">
                  <line x1="0" y1={scale * 0.25} x2={scale * 0.5} y2={scale * 0.25} stroke="#059669" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx={scale * 0.25} cy={scale * 0.25} r="1.5" fill="#047857" />
                </pattern>
              </defs>

              {/* 1. Metric Background Grid */}
              {showGrid && (
                <>
                  <rect width={canvasWidthPx} height={canvasHeightPx} fill="url(#grid1m)" />
                  <rect width={canvasWidthPx} height={canvasHeightPx} fill="url(#grid5m)" />
                </>
              )}

              {/* 2. Site Architecture Elements (Villa, Driveway, Pool, Terrace) */}
              {siteConfig.elements.map((elem) => {
                const elemX = elem.x * scale;
                const elemY = elem.y * scale;
                const elemW = elem.widthM * scale;
                const elemH = elem.heightM * scale;

                return (
                  <g key={elem.id}>
                    <rect
                      x={elemX}
                      y={elemY}
                      width={elemW}
                      height={elemH}
                      fill={elem.color || '#e2e8f0'}
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                      rx="4"
                    />
                    <text
                      x={elemX + elemW / 2}
                      y={elemY + elemH / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#475569"
                      fontSize="11"
                      fontWeight="bold"
                      className="pointer-events-none"
                    >
                      {elem.name}
                    </text>
                    <text
                      x={elemX + elemW / 2}
                      y={elemY + elemH / 2 + 14}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#64748b"
                      fontSize="9"
                      className="pointer-events-none"
                    >
                      {elem.widthM}m × {elem.heightM}m ({elem.widthM * elem.heightM} m²)
                    </text>
                  </g>
                );
              })}

              {/* 3. Hydraulic Mainline Network (From POC to Zone Valve Boxes) */}
              {showMainline &&
                placedList.map((zone) => {
                  const pocX = siteConfig.pocLocation.x * scale;
                  const pocY = siteConfig.pocLocation.y * scale;
                  const valveX = (zone.valveLocation?.x || zone.x + 0.5) * scale;
                  const valveY = (zone.valveLocation?.y || zone.y + 0.5) * scale;

                  // Routing via orthogonal L-pipe path
                  const midX = valveX;
                  const midY = pocY;

                  const isActiveInSim = isSimulating && activeSimZone?.id === zone.id;

                  return (
                    <g key={`pipe-${zone.id}`} className="transition-all">
                      {/* Pipe Glow when simulating */}
                      {isActiveInSim && (
                        <path
                          d={`M ${pocX} ${pocY} L ${midX} ${midY} L ${valveX} ${valveY}`}
                          fill="none"
                          stroke="#60a5fa"
                          strokeWidth="8"
                          strokeOpacity="0.4"
                          className="animate-pulse"
                        />
                      )}
                      {/* Heavy Mainline Pipe (Class 200) */}
                      <path
                        d={`M ${pocX} ${pocY} L ${midX} ${midY} L ${valveX} ${valveY}`}
                        fill="none"
                        stroke={isActiveInSim ? '#2563eb' : '#475569'}
                        strokeWidth={isActiveInSim ? '3.5' : '2'}
                        strokeDasharray={isActiveInSim ? '6 3' : 'none'}
                      />
                      {/* Direction flow marker arrow */}
                      <circle
                        cx={(pocX + midX) / 2}
                        cy={midY}
                        r="2.5"
                        fill={isActiveInSim ? '#3b82f6' : '#94a3b8'}
                      />
                    </g>
                  );
                })}

              {/* 4. Placed Irrigation Zones */}
              {placedList.map((zone) => {
                const zX = zone.x * scale;
                const zY = zone.y * scale;
                const zW = zone.widthM * scale;
                const zH = zone.heightM * scale;
                const isSelected = selectedZoneId === zone.id;
                const isActiveInSim = isSimulating && activeSimZone?.id === zone.id;

                // Color palette
                const fillStyle = zone.color ? `${zone.color}33` : 'rgba(2, 132, 199, 0.2)';
                const strokeColor = zone.color || '#0284c7';

                return (
                  <g
                    key={zone.id}
                    onPointerDown={(e) => handlePointerDownZone(e, zone.id)}
                    className="cursor-move group"
                  >
                    {/* Zone Boundary Rectangle */}
                    <rect
                      x={zX}
                      y={zY}
                      width={zW}
                      height={zH}
                      fill={fillStyle}
                      stroke={isSelected ? '#1e293b' : strokeColor}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                      strokeDasharray={zone.plantType.includes('Drip') ? '4 2' : 'none'}
                      rx="4"
                      className="transition-colors"
                    />

                    {/* Drip pattern background if drip zone */}
                    {zone.plantType.includes('Drip') && (
                      <rect
                        x={zX}
                        y={zY}
                        width={zW}
                        height={zH}
                        fill="url(#dripTubing)"
                        rx="4"
                        className="pointer-events-none"
                      />
                    )}

                    {/* Spray Coverage Arcs & Radiuses */}
                    {showSprayRadius && zone.plantType.includes('Spray') && (
                      <g className="pointer-events-none opacity-40">
                        {/* 4 Corner Sprinkler Heads */}
                        <circle cx={zX} cy={zY} r={(zone.sprayRadiusM || 3.8) * scale} fill="none" stroke={strokeColor} strokeWidth="1" strokeDasharray="3 3" />
                        <circle cx={zX + zW} cy={zY} r={(zone.sprayRadiusM || 3.8) * scale} fill="none" stroke={strokeColor} strokeWidth="1" strokeDasharray="3 3" />
                        <circle cx={zX} cy={zY + zH} r={(zone.sprayRadiusM || 3.8) * scale} fill="none" stroke={strokeColor} strokeWidth="1" strokeDasharray="3 3" />
                        <circle cx={zX + zW} cy={zY + zH} r={(zone.sprayRadiusM || 3.8) * scale} fill="none" stroke={strokeColor} strokeWidth="1" strokeDasharray="3 3" />
                      </g>
                    )}

                    {/* Sprinkler Heads / Emitters Marker Dots */}
                    {showHeads && (
                      <g className="pointer-events-none">
                        {/* 4 Corner Heads */}
                        <circle cx={zX + 4} cy={zY + 4} r="3" fill="#1e293b" />
                        <circle cx={zX + zW - 4} cy={zY + 4} r="3" fill="#1e293b" />
                        <circle cx={zX + 4} cy={zY + zH - 4} r="3" fill="#1e293b" />
                        <circle cx={zX + zW - 4} cy={zY + zH - 4} r="3" fill="#1e293b" />
                        {/* Intermediate head if width > 4m */}
                        {zone.widthM > 4 && (
                          <circle cx={zX + zW / 2} cy={zY + 4} r="3" fill="#1e293b" />
                        )}
                        {zone.widthM > 4 && (
                          <circle cx={zX + zW / 2} cy={zY + zH - 4} r="3" fill="#1e293b" />
                        )}
                      </g>
                    )}

                    {/* Zone Badge / Label */}
                    <g transform={`translate(${zX + 8}, ${zY + 8})`} className="pointer-events-none">
                      <rect
                        x="0"
                        y="0"
                        width={Math.min(zW - 16, 110)}
                        height="38"
                        rx="4"
                        fill="rgba(255, 255, 255, 0.95)"
                        stroke="#e2e8f0"
                        strokeWidth="1"
                      />
                      <text x="6" y="14" fill="#0f172a" fontSize="10" fontWeight="bold">
                        Z-{String(zone.zoneNumber).padStart(2, '0')}: {zone.zoneName.slice(0, 14)}
                      </text>
                      <text x="6" y="25" fill="#334155" fontSize="8" fontFamily="monospace">
                        {zone.flowM3h} m³/h · {zone.operatingTimeMinPerDay} min
                      </text>
                      <text x="6" y="34" fill="#64748b" fontSize="7">
                        {zone.areaM2}m² ({zone.widthM}m × {zone.heightM}m)
                      </text>
                    </g>

                    {/* Valve Box Indicator */}
                    <g
                      transform={`translate(${(zone.valveLocation?.x || zone.x + 0.5) * scale - 7}, ${(zone.valveLocation?.y || zone.y + 0.5) * scale - 7})`}
                      className="pointer-events-none"
                    >
                      <rect x="0" y="0" width="14" height="14" rx="2" fill="#047857" stroke="#ffffff" strokeWidth="1.5" />
                      <text x="7" y="10" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                        V
                      </text>
                    </g>

                    {/* Animated Flow Pulse when active in simulation */}
                    {isActiveInSim && (
                      <circle
                        cx={zX + zW / 2}
                        cy={zY + zH / 2}
                        r={Math.min(zW, zH) * 0.4}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="3"
                        strokeOpacity="0.8"
                        className="animate-ping"
                      />
                    )}
                  </g>
                );
              })}

              {/* 5. Smart Controller Box (ESP-TM2 WiFi) */}
              <g
                onPointerDown={handlePointerDownController}
                transform={`translate(${siteConfig.controllerLocation.x * scale - 12}, ${siteConfig.controllerLocation.y * scale - 12})`}
                className="cursor-move"
              >
                <rect x="0" y="0" width="24" height="24" rx="4" fill="#0284c7" stroke="#ffffff" strokeWidth="2" shadow="sm" />
                <text x="12" y="16" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                  ⚙
                </text>
                <text x="12" y="34" textAnchor="middle" fill="#0369a1" fontSize="9" fontWeight="bold" className="pointer-events-none">
                  ESP-TM2 Controller
                </text>
              </g>

              {/* 6. Point of Connection (POC / Water Meter) */}
              <g
                onPointerDown={handlePointerDownPOC}
                transform={`translate(${siteConfig.pocLocation.x * scale - 14}, ${siteConfig.pocLocation.y * scale - 14})`}
                className="cursor-move"
              >
                <circle cx="14" cy="14" r="14" fill="#1d4ed8" stroke="#ffffff" strokeWidth="2.5" />
                <text x="14" y="19" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">
                  M
                </text>
                <text x="14" y="38" textAnchor="middle" fill="#1e3a8a" fontSize="9" fontWeight="bold" className="pointer-events-none">
                  POC: {survey.staticPressureBar} bar ({survey.waterMeterSizeInch}")
                </text>
              </g>

              {/* 7. Metric Dimension Rulers */}
              {showDimensions && (
                <g className="pointer-events-none text-2xs fill-slate-400 font-mono">
                  {/* Top width ticks */}
                  {Array.from({ length: Math.floor(siteConfig.siteWidthM / 5) + 1 }).map((_, i) => (
                    <text key={`w-${i}`} x={i * 5 * scale + 4} y="12">
                      {i * 5}m
                    </text>
                  ))}
                  {/* Left height ticks */}
                  {Array.from({ length: Math.floor(siteConfig.siteLengthM / 5) + 1 }).map((_, i) => (
                    <text key={`h-${i}`} x="4" y={i * 5 * scale + 12}>
                      {i * 5}m
                    </text>
                  ))}
                </g>
              )}
            </svg>
          </div>

          {/* Quick instructions bar */}
          <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Move className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>
                <strong>Drag & Move:</strong> Click & drag any zone, the <strong>POC water meter [M]</strong>, or <strong>Controller [⚙]</strong> to reposition on site.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 bg-blue-600 rounded-full" />
              <span>Mainline: {survey.serviceLineSizeMm}mm</span>
              <span className="inline-block w-2.5 h-2.5 bg-emerald-700 rounded-sm" />
              <span>[V] Zone Solenoid Valve</span>
            </div>
          </div>
        </div>

        {/* Right Side: Zones Dock & Zone Inspector (1 Col) */}
        <div className="space-y-4">
          {/* Zone Inspector Card */}
          {selectedZone ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: selectedZone.color }}
                  />
                  <h3 className="font-bold text-slate-900 text-sm">
                    Zone {selectedZone.zoneNumber}: {selectedZone.zoneName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleUnplaceZone(selectedZone.id)}
                  className="text-2xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                  title="Remove from site and return to toolbox"
                >
                  Unplace
                </button>
              </div>

              {/* Zone Specs Table */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Plant / Emitter Type:</span>
                  <span className="font-medium text-slate-900 text-right">{selectedZone.plantType}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Hardware Specification:</span>
                  <span className="font-medium text-slate-900 text-right text-2xs max-w-[150px] truncate">
                    {selectedZone.emitterType}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Flow Demand:</span>
                  <span className="font-bold font-mono text-blue-700">
                    {selectedZone.flowM3h} m³/h ({selectedZone.flowGpm} GPM)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Precipitation Rate:</span>
                  <span className="font-mono text-slate-800">
                    {selectedZone.precipitationRateMmH} mm/h
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Operating Runtime:</span>
                  <span className="font-extrabold font-mono text-emerald-700">
                    {selectedZone.operatingTimeMinPerDay} min / cycle
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Control Solenoid:</span>
                  <span className="font-medium text-slate-700">{selectedZone.valveSize}</span>
                </div>
              </div>

              {/* Dimension Controls */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-800 block mb-2">
                  Adjust Zone Footprint (Meters):
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-2xs text-slate-500 block mb-1">
                      Width (m): <strong>{selectedZone.widthM}m</strong>
                    </label>
                    <input
                      type="range"
                      min="2"
                      max={Math.min(18, siteConfig.siteWidthM - selectedZone.x)}
                      step="0.5"
                      value={selectedZone.widthM}
                      onChange={(e) =>
                        handleUpdateZoneDimension(parseFloat(e.target.value), selectedZone.heightM)
                      }
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-2xs text-slate-500 block mb-1">
                      Length (m): <strong>{selectedZone.heightM}m</strong>
                    </label>
                    <input
                      type="range"
                      min="2"
                      max={Math.min(15, siteConfig.siteLengthM - selectedZone.y)}
                      step="0.5"
                      value={selectedZone.heightM}
                      onChange={(e) =>
                        handleUpdateZoneDimension(selectedZone.widthM, parseFloat(e.target.value))
                      }
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Color Palette Selector */}
              <div className="mt-3 pt-2">
                <span className="text-2xs font-semibold text-slate-500 block mb-1.5">
                  Zone Identification Theme:
                </span>
                <div className="flex items-center gap-1.5">
                  {ZONE_COLOR_PALETTES.map((c) => (
                    <button
                      key={c.bg}
                      type="button"
                      onClick={() => handleUpdateZoneColor(c.bg)}
                      className={`w-5 h-5 rounded-full cursor-pointer transition-transform ${
                        selectedZone.color === c.bg ? 'ring-2 ring-slate-900 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c.bg }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 text-center text-xs text-slate-500 shadow-xs">
              <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No Zone Selected</p>
              <p className="text-2xs text-slate-400 mt-1">
                Click any zone on the canvas to inspect hydraulic specs and adjust dimensions.
              </p>
            </div>
          )}

          {/* Zones Toolbox (Placed & Unplaced) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <h3 className="font-bold text-slate-900 text-sm">Hydraulic Zones ({placedZones.length})</h3>
              <span className="text-2xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {placedList.length} Placed
              </span>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {placedZones.map((z) => {
                const isSelected = selectedZoneId === z.id;
                return (
                  <div
                    key={z.id}
                    onClick={() => {
                      setSelectedZoneId(z.id);
                      if (!z.isPlaced) {
                        handleDropUnplacedZone(z.id);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                        : z.isPlaced
                        ? 'border-slate-200 bg-slate-50/70 hover:bg-slate-100'
                        : 'border-dashed border-amber-300 bg-amber-50/40 hover:bg-amber-100/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: z.color || '#0284c7' }}
                        />
                        <span className="font-bold text-slate-900">
                          Z-{String(z.zoneNumber).padStart(2, '0')}: {z.zoneName}
                        </span>
                      </div>
                      {z.isPlaced ? (
                        <span className="text-3xs px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                          Placed
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDropUnplacedZone(z.id);
                          }}
                          className="text-3xs px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-600 text-white font-bold"
                        >
                          + Place
                        </button>
                      )}
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-2xs text-slate-500 font-mono">
                      <span>{z.flowM3h} m³/h</span>
                      <span>{z.operatingTimeMinPerDay} min/day</span>
                      <span>{z.areaM2} m²</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
