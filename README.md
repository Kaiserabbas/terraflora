# 🌿 TerraFlora - Landscape Site Survey & BOQ Excel Architect

<div align="center">

![TerraFlora Banner](https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1600&q=80)

**Enterprise Landscape Architecture, Field Site Survey, Rain Bird® Hydraulic Engineering & Multi-Tab Bill of Quantities (BOQ) Generator**

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini API](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75B2?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

[Live Demo](#) · [Key Features](#-key-features) · [Hydraulic Engineering](#-rain-bird-hydraulic-engineering) · [BOQ Architecture](#-multi-tab-excel-boq-architecture) · [Getting Started](#-getting-started) · [Author](#-author)

</div>

---

## 📌 Executive Overview

**TerraFlora** is a specialized, enterprise-grade software suite designed specifically for Landscape Architects, Irrigation Design Engineers, Commercial Estimators, and Horticultural Contractors operating in arid and subtropical regions (UAE, GCC, Middle East, Mediterranean, and South Asia).

Modern landscape estimation and irrigation planning often suffer from fragmented workflows—manual spreadsheets, disconnected hydraulic sizing, and guesswork on plant cultural requirements. **TerraFlora** bridges the entire lifecycle from field survey to commercial handover:

```
[ Field Site Survey ] ──> [ Rain Bird® Hydraulics ] ──> [ Interactive 2D Layout ] ──> [ Automated 6-Div BOQ ] ──> [ 7-Tab Excel & PDF Export ]
          │                         │                              │                          │                           │
          ▼                         ▼                              ▼                          ▼                           ▼
Soil & Water Readings     3-Rule Safe Flow Analysis     Sprinkler Spray Simulation      Live Multi-Currency       Commercial Client Proposal
```

---

## ✨ Key Features

### 📋 1. Rigorous Field Site Survey Engine
* **Project & Client Profiling:** Record cadastral plot dimensions, client brief, timeline milestones, and site access constraints.
* **Surface Footprint Breakdown:** Track total landscape area, living lawn / turfgrass, planting beds, specimen tree zones, and hardscape paving.
* **Horticultural Preferences:** Select lawn varieties, installation methods (sod rolls, stolons/sprigs, artificial turf), perimeter hedges, formal boxwood borders, shade trees, specimen palms, and decorative mulches.
* **Soil & Terrain Physics:** Record soil textures (*coarse sand, sandy loam, silt loam, heavy clay*), infiltration rates ($mm/h$), slope categories ($0-5\%$ flat to $12\%+$ steep), sun radiation exposure, and prevailing wind velocities.
* **Hydraulic Supply Audit:** Log water source origin (*municipal potable, deep well, booster tank, TSE recycled water*), static pressure at point of connection (POC), AWWA water meter dimensions, and service line pipe diameter and material.

### 💧 2. Rain Bird® Hydraulic Engineering Engine
* **3-Rule Safe Water Capacity Governing Analysis:**
  * **Rule 1:** Limit pressure drop through the water meter to $\le 10\%$ of static municipal pressure.
  * **Rule 2:** Limit continuous flow to $\le 75\%$ of the AWWA safe maximum continuous flow rating.
  * **Rule 3:** Limit service line flow velocity to $\le 2.0\text{ m/s}$ ($6.5\text{ ft/s}$) to mitigate water hammer, cavitation, and excessive friction head loss.
* **Precipitation Rate (PR) Calculation:**
  $$\text{PR}_{\text{metric}} = \frac{1000 \times Q}{S \times L} \quad (\text{mm/h}) \qquad \vert \qquad \text{PR}_{\text{US}} = \frac{96.3 \times Q}{S \times L} \quad (\text{in/h})$$
* **Zone Operating Time (OT) Calculation:**
  $$\text{OT} = \frac{I \times 60}{\text{PR} \times \text{DA}} \quad (\text{minutes/day})$$
* **Soil Intake Rate Validation:** Compares sprinkler application rates against USDA / Rain Bird soil intake maximums to prevent water runoff, puddling, and erosion.
* **Nocturnal Water Window Validation:** Checks cumulative zone runtimes against the site's allowable irrigation window (e.g., 6 hours/night between 10 PM and 4 AM).

### 🗺️ 3. Interactive 2D Visual Site Mapper
* **Interactive Canvas:** Scalable 2D blueprint workspace with zoom, panning, and multi-tier grid snapping ($0.5\text{m}, 1\text{m}, 2\text{m}$).
* **Architectural Presets:** Instant loading of site layouts: *Mediterranean Courtyard Villa, Modern Minimalist Estate, Luxury Palm Oasis, and Xeriscape Arid Garden*.
* **Zone Geometry & Placement:** Visual drag-and-drop placement of turf rotor zones, shrub drip zones, tree bubbler rings, and flower micro-sprays.
* **POC & Controller Positioning:** Position the Point of Connection and Rain Bird ESP-TM2 / ESP-Me controller with real-time pipe run distance calculation.
* **Animated Hydraulic Simulation:** Dynamic sprinkler spray radius visualizer and animated water flow emitters to verify coverage and head overlap.
* **Live Hydraulic Load Meter:** Displays instant flow ($m^3/h$ and GPM), head count, and safe flow headroom bar.

### 🌸 4. Botanical & Hardscape Curated Library
* **5,300+ Line Horticultural Library:** Over 150+ regional plant species and hardscape materials tailored for Gulf (UAE/GCC) and Mediterranean climates.
* **Categorized Taxonomy:**
  * *Turfgrasses:* Bermuda Tifway 419, Paspalum Platinum TE, Zoysia Japonica, Dichondra repens.
  * *Specimen Trees:* Delonix regia (Flamboyant), Azadirachta indica (Neem), Jacaranda mimosifolia, Plumeria alba (Frangipani).
  * *Specimen Palms:* Phoenix dactylifera (Date Palm), Washingtonia robusta, Bismarckia nobilis, Copernicia alba.
  * *Shrubs & Hedges:* Bougainvillea spectabilis, Jasminum sambac, Tecoma stans, Ixora coccinea, Hibiscus rosa-sinensis.
  * *Groundcovers & Succulents:* Wedelia trilobata, Vinca rosea, Sesuvium portulacastrum, Agave americana.
  * *Hardscaping & Outdoor Living:* Outdoor porcelain pavers ($600\times 600\times 20\text{mm}$ R11), cantilever aluminum umbrellas, teak garden benches, weatherproof outdoor sofas, and LED landscape lighting.
* **Cultural Metadata:** Water demand (*Low, Medium, High*), sun requirements (*Full Sun, Partial, Shade*), planting spacing, container specs, and market benchmark pricing.

### 💰 5. Automated 6-Division Bill of Quantities (BOQ)
* **Division A:** Site Preliminaries, Demolition, Subgrade Excavation & Sweet Sand Topsoil
* **Division B:** Softscaping, Sod Installation, Specimen Trees, Shrubs, Groundcovers & Organic Mulch
* **Division C:** Rain Bird® Automatic Irrigation System (Piping, PE-100, Valves, Solenoids, Sensors, Emitters)
* **Division D:** Hardscaping, Outdoor Living (Pavers, Benches, Cantilever Umbrellas, Garden Sofas, Edging)
* **Division E:** Skilled Horticultural & Irrigation Labor, Hydrostatic Testing & Commissioning
* **Division F:** 90-Day Post-Planting Maintenance, Plant Replacement Warranty & Handover
* **Financial Controls:** Dynamic Contractor Overhead & Profit Margin ($\%$), Contingency Reserve ($\%$), and Sales Tax / VAT ($\%$).

### 💱 6. Global Multi-Currency Engine
* Real-time currency conversion across **17 major global currencies**:
  `AED`, `SAR`, `QAR`, `OMR`, `KWD`, `BHD`, `USD`, `EUR`, `GBP`, `CAD`, `AUD`, `PKR`, `INR`, `SGD`, `MYR`, `EGP`, `TRY`.
* Live exchange rate synchronization with robust offline caching and fallback baselines.

### 📊 7. Multi-Tab Excel & Branded PDF Exporters
* **7-Sheet Formatted Excel Workbook (`.xlsx`):**
  1. `Executive Summary`: Commercial recap, contract info, key surface metrics, and signatures.
  2. `Site Survey Record`: Comprehensive question-by-question survey field audit log.
  3. `Bill of Quantities (BOQ)`: Full itemized schedule grouped by Divisions A–F with subtotal formulas.
  4. `Plant Schedule`: Botanical palette with Latin nomenclature, container sizes, and nursery benchmarks.
  5. `Hardscape & Outdoor Living`: Schedule of furniture, pavers, umbrellas, and shade structures.
  6. `Services & Preliminaries`: Earthworks, labor, hydrostatic testing, and maintenance.
  7. `Irrigation Hydraulics`: 3-rule capacity calculations, valve circuit schedule, and run-time audit.
* **Branded PDF Quotation (`.pdf`):** Multi-page executive proposal with corporate letterhead, division breakdowns, payment milestones, and client signature authorization blocks.

### 🤖 8. AI Landscape Architect Advisor (Google Gemini)
* Integrated with Google Gemini 2.5 Flash via `@google/genai`.
* Analyzes soil chemistry, slope, static pressure, and microclimates to deliver:
  * Executive architectural vision concept.
  * Climate-adapted botanical selections.
  * Rain Bird cycle-and-soak scheduling to prevent sandy soil leaching and clay runoff.
  * Strategic BOQ upgrades with estimated cost impacts.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript 7](https://www.typescriptlang.org/) |
| **Build & Bundler** | [Vite 8](https://vitejs.dev/) |
| **Styling & Design System** | [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/vite` |
| **Icons & UI Micro-Interactions** | [Lucide React](https://lucide.dev/) + [Motion](https://motion.dev/) |
| **Spreadsheet Engine** | [SheetJS (xlsx)](https://docs.sheetjs.com/) for multi-tab Excel creation |
| **PDF Generation Engine** | [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) |
| **Backend & API Server** | [Express 4](https://expressjs.com/) + [Node.js](https://nodejs.org/) + [tsx](https://github.com/privatenumber/tsx) |
| **Artificial Intelligence** | [Google Gen AI SDK (`@google/genai`)](https://www.npmjs.com/package/@google/genai) |

---

## 📂 Project Directory Structure

```
terraflora/
├── .aistudio/                  # AI Studio project configuration
├── src/
│   ├── components/             # Reusable modular UI components
│   │   ├── AddCustomItemModal.tsx   # Custom material & rate creator
│   │   ├── AIAdvisorModal.tsx       # Gemini AI Landscape Architect modal
│   │   ├── BOQSheet.tsx             # Master Bill of Quantities table & summary
│   │   ├── Header.tsx               # Application header with currency & tab controls
│   │   ├── HydraulicSchedule.tsx    # Rain Bird valve & flow calculation schedule
│   │   ├── PlantPaletteView.tsx     # Visual plant cards & palette gallery
│   │   ├── PlantPickerModal.tsx     # 5,300+ item botanical catalog modal
│   │   ├── ProposalPreview.tsx      # Formal client proposal & contract view
│   │   ├── SurveyForm.tsx           # Comprehensive site survey field input form
│   │   └── VisualSiteMapper.tsx     # 2D interactive canvas & spray simulation
│   ├── data/
│   │   └── plantCatalog.ts          # Curated botanical & hardscape database (5,300+ lines)
│   ├── types/
│   │   └── landscape.ts             # TypeScript interfaces for survey, boq, & hydraulics
│   ├── utils/
│   │   ├── aiAdvisorService.ts      # Client-side connector for AI landscape advisor
│   │   ├── calculations.test.ts     # Unit tests for hydraulic & financial math
│   │   ├── calculations.ts          # Rain Bird hydraulic formulas & BOQ generator
│   │   ├── currencyService.ts       # Real-time multi-currency exchange rates
│   │   ├── excelExporter.ts         # 7-Sheet automated Excel export engine
│   │   ├── pdfExporter.ts           # Branded client proposal PDF generator
│   │   └── siteLayoutPresets.ts     # Architectural villa presets & zone mappings
│   ├── App.tsx                      # Root application state & controller
│   ├── index.css                    # Global typography & Tailwind styles
│   └── main.tsx                     # React DOM entry point
├── .env.example                 # Environment variables blueprint
├── .gitignore                   # Version control exclusion rules
├── index.html                   # HTML5 application shell
├── metadata.json                # Project descriptor & AI Studio capabilities
├── package.json                 # Project dependencies & build scripts
├── README.md                    # Comprehensive documentation
├── server.ts                    # Express backend proxy for Google Gemini API
├── tsconfig.json                # TypeScript compiler configuration
└── vite.config.ts               # Vite bundler configuration
```

---

## 📐 Rain Bird® Hydraulic Engineering Formulas

TerraFlora implements the engineering standards outlined in the **Rain Bird Landscape Irrigation Design Manual**:

### 1. Water Meter Maximum Flow & Pressure Loss
```
Rule 1: ΔP_meter ≤ 0.10 × P_static
Rule 2: Q_meter ≤ 0.75 × Q_safe_max
Rule 3: V_service ≤ 2.0 m/s (6.5 ft/s)
Governing Design Flow = min(Rule 1, Rule 2, Rule 3)
```

### 2. Sprinkler Precipitation Rate (Metric)
$$\text{PR} = \frac{1000 \times Q}{S \times L}$$
* $Q$: Total zone flow in cubic meters per hour ($m^3/h$)
* $S$: Spacing between sprinkler heads in meters ($m$)
* $L$: Spacing between rows of sprinklers in meters ($m$)

### 3. Cycle Run-Time per Day
$$\text{OT} = \frac{I \times 60}{\text{PR} \times \text{DA}}$$
* $I$: Weekly irrigation requirement in millimeters ($mm/\text{week}$)
* $\text{PR}$: Precipitation rate in millimeters per hour ($mm/h$)
* $\text{DA}$: Available irrigation days per week (e.g., 3, 5, or 7)

---

## 📑 Multi-Tab Excel BOQ Architecture

When clicking **"Export Multi-Tab Excel (BOQ & Hydraulics)"**, the system builds an OpenXML `.xlsx` workbook containing:

| Sheet Tab | Purpose & Contents |
|---|---|
| **1. Executive Summary** | Project ID, client data, contract duration, measured surface areas, commercial recap, and contractor/client signature acceptance lines. |
| **2. Site Survey Record** | Every field survey entry including soil classification, slope, wind direction, water meter size, and client aesthetic preferences. |
| **3. Bill of Quantities (BOQ)** | Fully categorized schedule (Divisions A through F) with item codes, descriptions, specs, quantities, units, unit rates, and totals. |
| **4. Plant Schedule** | Botanical palette listing common names, Latin/botanical species, container sizes, quantities, and nursery price benchmarks. |
| **5. Hardscape & Outdoor Living** | Detailed list of pavers, cantilever umbrellas, garden furniture, edging, and pergolas. |
| **6. Services & Preliminaries** | Site clearance, earthworks, sweet sand filling, skilled labor, testing, and 90-day maintenance warranty. |
| **7. Irrigation Hydraulics** | Water source capacity check, governing rule, valve zone schedule, flow in $m^3/h$ & GPM, precipitation rate, and run-times. |

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or higher (v20+ recommended)
* **npm** or **bun**
* **Google Gemini API Key** (optional, for AI Landscape Advisor features)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Kaiserabbas/terraflora.git
   cd terraflora
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and configure your API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```

4. **Launch Local Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

5. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 🧪 Testing & Verification

Unit calculations for hydraulic formulas and BOQ summaries are located in `src/utils/calculations.test.ts`.
You can verify the calculations and linting with:

```bash
npm run lint
```

---

## 👨‍💻 Author

**Qaisar Abbas**
* **GitHub:** [@Kaiserabbas](https://github.com/Kaiserabbas)
* **Website:** [Portfolio](https://www.qaisar-resume.netlify.app/)
* **Specialization:** Full Stack Web Applications, Horticultural & Irrigation Tech Architecture

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
