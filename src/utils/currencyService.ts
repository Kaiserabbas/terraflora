export type CurrencyCode =
  | 'PKR'
  | 'INR'
  | 'AED'
  | 'SAR'
  | 'QAR'
  | 'OMR'
  | 'KWD'
  | 'BHD'
  | 'EUR'
  | 'USD'
  | 'GBP'
  | 'CAD'
  | 'AUD'
  | 'SGD'
  | 'MYR'
  | 'EGP'
  | 'TRY';

export interface CurrencyMetadata {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string;
  decimals: number;
}

export const CURRENCY_METADATA: Record<CurrencyCode, CurrencyMetadata> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', decimals: 2 },
  AED: { code: 'AED', name: 'UAE Dirham', symbol: 'AED ', flag: '🇦🇪', decimals: 2 },
  SAR: { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR ', flag: '🇸🇦', decimals: 2 },
  QAR: { code: 'QAR', name: 'Qatari Riyal', symbol: 'QAR ', flag: '🇶🇦', decimals: 2 },
  OMR: { code: 'OMR', name: 'Omani Rial', symbol: 'OMR ', flag: '🇴🇲', decimals: 3 },
  KWD: { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KWD ', flag: '🇰🇼', decimals: 3 },
  BHD: { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BHD ', flag: '🇧🇭', decimals: 3 },
  PKR: { code: 'PKR', name: 'Pakistani Rupee', symbol: 'Rs. ', flag: '🇵🇰', decimals: 0 },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', decimals: 2 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', decimals: 2 },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', decimals: 2 },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦', decimals: 2 },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', decimals: 2 },
  SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', decimals: 2 },
  MYR: { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM ', flag: '🇲🇾', decimals: 2 },
  EGP: { code: 'EGP', name: 'Egyptian Pound', symbol: 'EGP ', flag: '🇪🇬', decimals: 2 },
  TRY: { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷', decimals: 2 },
};

// Robust baseline rates (per 1 USD)
export const DEFAULT_EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 1.0,
  AED: 3.6725,
  SAR: 3.75,
  QAR: 3.64,
  OMR: 0.385,
  KWD: 0.308,
  BHD: 0.376,
  PKR: 278.5,
  INR: 86.85,
  EUR: 0.925,
  GBP: 0.785,
  CAD: 1.39,
  AUD: 1.54,
  SGD: 1.345,
  MYR: 4.45,
  EGP: 49.3,
  TRY: 35.8,
};

export interface LiveRatesResponse {
  rates: Record<CurrencyCode, number>;
  source: string;
  lastUpdated: string;
  isLive: boolean;
}

/**
 * Fetch real-time live currency rates from free public API
 */
export async function fetchLiveExchangeRates(): Promise<LiveRatesResponse> {
  const apis = [
    'https://open.er-api.com/v6/latest/USD',
    'https://api.exchangerate-api.com/v4/latest/USD',
  ];

  for (const url of apis) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = await res.json();
        const apiRates = data.rates || {};

        const merged: Record<CurrencyCode, number> = { ...DEFAULT_EXCHANGE_RATES };
        for (const code of Object.keys(DEFAULT_EXCHANGE_RATES) as CurrencyCode[]) {
          if (apiRates[code] && typeof apiRates[code] === 'number') {
            merged[code] = apiRates[code];
          }
        }

        return {
          rates: merged,
          source: url.includes('open.er-api') ? 'Open Exchange Rates (Live)' : 'ExchangeRate-API (Live)',
          lastUpdated: new Date().toLocaleTimeString(),
          isLive: true,
        };
      }
    } catch {
      // Continue to next fallback
    }
  }

  // Graceful offline fallback
  return {
    rates: DEFAULT_EXCHANGE_RATES,
    source: 'Standard Market Reference (Offline Fallback)',
    lastUpdated: 'Cached',
    isLive: false,
  };
}

/**
 * Convert an amount from USD base to target currency using exchange rates
 */
export function convertFromUSD(amountUSD: number, targetCurrency: CurrencyCode, rates: Record<CurrencyCode, number>): number {
  const rate = rates[targetCurrency] || DEFAULT_EXCHANGE_RATES[targetCurrency] || 1.0;
  return Number((amountUSD * rate).toFixed(2));
}

/**
 * Format currency with appropriate symbol and precision
 */
export function formatWithCurrency(
  amount: number,
  currency: CurrencyCode,
  rates?: Record<CurrencyCode, number>,
  isRawUSD: boolean = false
): string {
  const meta = CURRENCY_METADATA[currency] || CURRENCY_METADATA.USD;
  const valueToFormat = isRawUSD && rates ? convertFromUSD(amount, currency, rates) : amount;

  return `${meta.symbol}${valueToFormat.toLocaleString('en-US', {
    minimumFractionDigits: meta.decimals,
    maximumFractionDigits: meta.decimals,
  })}`;
}
