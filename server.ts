import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK on server
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// AI Landscape Architect & Estimator Endpoint
app.post('/api/ai/landscape-advisor', async (req: Request, res: Response) => {
  try {
    const { survey, currentItems } = req.body;

    if (!survey) {
      return res.status(400).json({ error: 'Missing survey data' });
    }

    const systemPrompt = `You are a licensed Senior Landscape Architect and Rain Bird Certified Irrigation Designer with 15+ years experience in the UAE, GCC, and international arid/semi-arid regions.
Analyze the provided landscape site survey readings (soil texture, slope, sun radiation, water meter hydraulics, and client preferences).
Provide high-value, practical professional advice with specific botanical selections, hardscape & outdoor living amenities (e.g. cantilever umbrellas, garden sofas, benches, porcelain pavers), and Rain Bird hydraulic adjustments.
Return your response strictly in structured JSON matching the provided schema.`;

    const userPrompt = `SITE SURVEY DATA:
- Project: ${survey.projectName || 'Residential Villa Garden'} (${survey.projectType || 'residential'})
- Location: ${survey.siteAddress || 'Dubai, UAE'}
- Total Landscape Area: ${survey.totalLandscapeAreaM2 || 350} m2 (Turf: ${survey.turfAreaM2 || 150} m2, Beds: ${survey.plantingBedsAreaM2 || 120} m2, Hardscape: ${survey.hardscapeAreaM2 || 80} m2)
- Turf Preference: ${survey.turfPreference?.selectedType || 'Bermuda Grass Tifway 419'} (${survey.turfPreference?.installationMethod || 'sod_rolls'})
- Soil Texture: ${survey.soilTexture || 'light_sandy_loam'} (Infiltration rate: ${survey.soilInfiltrationRateMmH || 32} mm/h)
- Slope: ${survey.slopePercent || 2}% (${survey.slopeCategory || 'flat_0_5'})
- Sunlight Exposure: ${survey.sunExposure || 'full_sun'}
- Wind: ${survey.windCondition || 'moderate'} (Dir: ${survey.prevailingWindDirection || 'NW'})
- Water Source: ${survey.waterSource || 'municipal_main'} (Static Pressure: ${survey.staticPressureBar || 4.5} bar, Meter: ${survey.waterMeterSizeInch || '1'} inch)
- Client Brief & Special Notes: "${survey.clientSpecialNotes || 'Luxury private garden with fragrant evening flowers, child-friendly turf, and outdoor living area'}"

Please analyze this site and formulate:
1. Executive architectural concept statement.
2. Recommended plants with reasons for soil/climate suitability (UAE & Mediterranean adapted).
3. Recommended outdoor living & hardscape features (cantilever umbrella, garden sofa lounge, benches, pavers).
4. Rain Bird irrigation engineering advice (cycle-and-soak, nozzle selection, water window safety).
5. 3 specific BOQ item additions or upgrades with estimated rate in USD.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveConcept: {
              type: Type.STRING,
              description: 'Executive design philosophy and concept summary for the client.',
            },
            recommendedPlants: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  commonName: { type: Type.STRING },
                  botanicalName: { type: Type.STRING },
                  category: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  suggestedQty: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  estRateUSD: { type: Type.NUMBER },
                },
                required: ['commonName', 'botanicalName', 'category', 'reason', 'suggestedQty', 'unit', 'estRateUSD'],
              },
            },
            outdoorLivingRecommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  itemName: { type: Type.STRING },
                  category: { type: Type.STRING },
                  placementReason: { type: Type.STRING },
                  suggestedQty: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  estRateUSD: { type: Type.NUMBER },
                },
                required: ['itemName', 'category', 'placementReason', 'suggestedQty', 'unit', 'estRateUSD'],
              },
            },
            irrigationEngineeringAdvice: {
              type: Type.STRING,
              description: 'Hydraulic recommendations, Rain Bird nozzle selection, and cycle-and-soak runtime tips.',
            },
            boqAdditions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  section: { type: Type.STRING },
                  category: { type: Type.STRING },
                  description: { type: Type.STRING },
                  specification: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  unitRateUSD: { type: Type.NUMBER },
                },
                required: ['section', 'category', 'description', 'specification', 'quantity', 'unit', 'unitRateUSD'],
              },
            },
          },
          required: [
            'executiveConcept',
            'recommendedPlants',
            'outdoorLivingRecommendations',
            'irrigationEngineeringAdvice',
            'boqAdditions',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Gemini Landscape Advisor Error:', error);
    return res.status(500).json({
      error: 'Failed to generate AI recommendations',
      message: error?.message || 'Server error',
    });
  }
});

// Setup Vite middleware in development or static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`TerraFlora Server running at http://localhost:${port}`);
  });
}

startServer();
