// Alpha Vantage Complete API Service
// Based on MCP documentation: https://mcp.alphavantage.co
// All endpoints from Core Stocks, Crypto, Forex, Commodities, Economic Indicators, Technical Indicators

const API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || 'demo';
const BASE_URL = 'https://www.alphavantage.co/query';

// Top cryptocurrencies by market cap (updated list)
export const TOP_CRYPTO_SYMBOLS = [
    { symbol: 'BTC', name: 'Bitcoin', color: '#f7931a' },
    { symbol: 'ETH', name: 'Ethereum', color: '#627eea' },
    { symbol: 'XRP', name: 'XRP', color: '#23292f' },
    { symbol: 'SOL', name: 'Solana', color: '#14f195' },
    { symbol: 'BNB', name: 'BNB', color: '#f3ba2f' },
    { symbol: 'DOGE', name: 'Dogecoin', color: '#c3a634' },
    { symbol: 'ADA', name: 'Cardano', color: '#0033ad' },
    { symbol: 'TRX', name: 'TRON', color: '#eb0029' },
    { symbol: 'AVAX', name: 'Avalanche', color: '#e84142' },
    { symbol: 'LINK', name: 'Chainlink', color: '#2a5ada' },
    { symbol: 'DOT', name: 'Polkadot', color: '#e6007a' },
    { symbol: 'LTC', name: 'Litecoin', color: '#bfbbbb' },
    { symbol: 'XLM', name: 'Stellar', color: '#14b6e7' },
    { symbol: 'ATOM', name: 'Cosmos', color: '#2e3148' },
    { symbol: 'UNI', name: 'Uniswap', color: '#ff007a' },
];

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface TimeSeriesData {
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface StockQuote {
    symbol: string;
    open: number;
    high: number;
    low: number;
    price: number;
    volume: number;
    latestTradingDay: string;
    previousClose: number;
    change: number;
    changePercent: number;
}

export interface CryptoQuote {
    symbol: string;
    name: string;
    price: number;
    bidPrice: number;
    askPrice: number;
    lastUpdated: string;
}

export interface NewsArticle {
    title: string;
    url: string;
    source: string;
    summary: string;
    bannerImage?: string;
    sentiment: string;
    sentimentScore: number;
    publishedAt: string;
    tickers: { ticker: string; sentiment: string; sentimentScore: number }[];
}

export interface TopMover {
    ticker: string;
    price: string;
    changeAmount: string;
    changePercentage: string;
    volume: string;
}

export interface CompanyOverview {
    symbol: string;
    name: string;
    description: string;
    exchange: string;
    currency: string;
    country: string;
    sector: string;
    industry: string;
    marketCap: number;
    peRatio: number;
    pegRatio: number;
    bookValue: number;
    dividendPerShare: number;
    dividendYield: number;
    eps: number;
    revenuePerShareTTM: number;
    profitMargin: number;
    operatingMarginTTM: number;
    returnOnAssetsTTM: number;
    returnOnEquityTTM: number;
    revenueTTM: number;
    grossProfitTTM: number;
    dilutedEPSTTM: number;
    week52High: number;
    week52Low: number;
    day50MovingAverage: number;
    day200MovingAverage: number;
    sharesOutstanding: number;
    beta: number;
    analystTargetPrice: number;
}

export interface EarningsData {
    fiscalDateEnding: string;
    reportedEPS: number;
    estimatedEPS: number;
    surprise: number;
    surprisePercentage: number;
}

export interface CommodityData {
    date: string;
    value: number;
}

export interface EconomicData {
    date: string;
    value: number;
}

export interface TechnicalIndicator {
    timestamp: string;
    value: number;
}

export interface MarketStatus {
    region: string;
    marketType: string;
    primaryExchanges: string;
    localOpen: string;
    localClose: string;
    currentStatus: string;
    notes: string;
}

// Crypto name mappings
const CRYPTO_NAMES: Record<string, string> = {
    BTC: 'Bitcoin', ETH: 'Ethereum', XRP: 'XRP', SOL: 'Solana', ADA: 'Cardano',
    DOGE: 'Dogecoin', DOT: 'Polkadot', MATIC: 'Polygon', LINK: 'Chainlink',
    AVAX: 'Avalanche', LTC: 'Litecoin', UNI: 'Uniswap', ATOM: 'Cosmos',
    XLM: 'Stellar', ALGO: 'Algorand', BNB: 'Binance Coin', TRX: 'Tron', SHIB: 'Shiba Inu',
};

class AlphaVantageAPI {
    private cache = new Map<string, { data: any; timestamp: number }>();
    private cacheTimeout = 60000; // 1 minute

    private async fetch(params: Record<string, string>, cacheKey: string): Promise<any> {
        // Check cache
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        // Build URL
        const url = new URL(BASE_URL);
        Object.entries({ ...params, apikey: API_KEY }).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });

        try {
            const response = await fetch(url.toString());
            const data = await response.json();

            // Check for API limitations/errors - use warn to avoid error overlay
            if (data.Note) {
                // Rate limit - silent fail
                return null;
            }
            if (data['Error Message']) {
                // Invalid API call - silent fail, don't spam console
                return null;
            }
            if (data.Information) {
                // API info message - silent fail
                return null;
            }

            // Cache successful response
            this.cache.set(cacheKey, { data, timestamp: Date.now() });
            return data;
        } catch {
            // Network error - silent fail
            return null;
        }
    }

    // ============================================
    // CORE STOCK APIs
    // ============================================

    async getIntradayTimeSeries(symbol: string, interval: '1min' | '5min' | '15min' | '30min' | '60min' = '5min'): Promise<TimeSeriesData[]> {
        const data = await this.fetch(
            { function: 'TIME_SERIES_INTRADAY', symbol, interval },
            `intraday_${symbol}_${interval}`
        );
        if (!data?.[`Time Series (${interval})`]) return [];

        return Object.entries(data[`Time Series (${interval})`]).slice(0, 100).map(([ts, v]: [string, any]) => ({
            timestamp: ts,
            open: parseFloat(v['1. open']),
            high: parseFloat(v['2. high']),
            low: parseFloat(v['3. low']),
            close: parseFloat(v['4. close']),
            volume: parseFloat(v['5. volume']),
        })).reverse();
    }

    async getDailyTimeSeries(symbol: string, adjusted = false): Promise<TimeSeriesData[]> {
        const func = adjusted ? 'TIME_SERIES_DAILY_ADJUSTED' : 'TIME_SERIES_DAILY';
        const data = await this.fetch({ function: func, symbol }, `daily_${symbol}_${adjusted}`);
        const key = adjusted ? 'Time Series (Daily)' : 'Time Series (Daily)';
        if (!data?.[key]) return [];

        return Object.entries(data[key]).slice(0, 100).map(([date, v]: [string, any]) => ({
            timestamp: date,
            open: parseFloat(v['1. open']),
            high: parseFloat(v['2. high']),
            low: parseFloat(v['3. low']),
            close: parseFloat(v['4. close'] || v['5. adjusted close']),
            volume: parseFloat(v['5. volume'] || v['6. volume']),
        })).reverse();
    }

    async getWeeklyTimeSeries(symbol: string, adjusted = false): Promise<TimeSeriesData[]> {
        const func = adjusted ? 'TIME_SERIES_WEEKLY_ADJUSTED' : 'TIME_SERIES_WEEKLY';
        const data = await this.fetch({ function: func, symbol }, `weekly_${symbol}_${adjusted}`);
        const key = adjusted ? 'Weekly Adjusted Time Series' : 'Weekly Time Series';
        if (!data?.[key]) return [];

        return Object.entries(data[key]).slice(0, 52).map(([date, v]: [string, any]) => ({
            timestamp: date,
            open: parseFloat(v['1. open']),
            high: parseFloat(v['2. high']),
            low: parseFloat(v['3. low']),
            close: parseFloat(v['4. close'] || v['5. adjusted close']),
            volume: parseFloat(v['5. volume'] || v['6. volume']),
        })).reverse();
    }

    async getMonthlyTimeSeries(symbol: string, adjusted = false): Promise<TimeSeriesData[]> {
        const func = adjusted ? 'TIME_SERIES_MONTHLY_ADJUSTED' : 'TIME_SERIES_MONTHLY';
        const data = await this.fetch({ function: func, symbol }, `monthly_${symbol}_${adjusted}`);
        const key = adjusted ? 'Monthly Adjusted Time Series' : 'Monthly Time Series';
        if (!data?.[key]) return [];

        return Object.entries(data[key]).slice(0, 60).map(([date, v]: [string, any]) => ({
            timestamp: date,
            open: parseFloat(v['1. open']),
            high: parseFloat(v['2. high']),
            low: parseFloat(v['3. low']),
            close: parseFloat(v['4. close'] || v['5. adjusted close']),
            volume: parseFloat(v['5. volume'] || v['6. volume']),
        })).reverse();
    }

    async getGlobalQuote(symbol: string): Promise<StockQuote | null> {
        const data = await this.fetch({ function: 'GLOBAL_QUOTE', symbol }, `quote_${symbol}`);
        if (!data?.['Global Quote'] || Object.keys(data['Global Quote']).length === 0) return null;

        const q = data['Global Quote'];
        return {
            symbol: q['01. symbol'],
            open: parseFloat(q['02. open']),
            high: parseFloat(q['03. high']),
            low: parseFloat(q['04. low']),
            price: parseFloat(q['05. price']),
            volume: parseFloat(q['06. volume']),
            latestTradingDay: q['07. latest trading day'],
            previousClose: parseFloat(q['08. previous close']),
            change: parseFloat(q['09. change']),
            changePercent: parseFloat(q['10. change percent']?.replace('%', '') || '0'),
        };
    }

    async searchSymbol(keywords: string): Promise<{ symbol: string; name: string; type: string; region: string }[]> {
        const data = await this.fetch({ function: 'SYMBOL_SEARCH', keywords }, `search_${keywords}`);
        if (!data?.bestMatches) return [];

        return data.bestMatches.map((m: any) => ({
            symbol: m['1. symbol'],
            name: m['2. name'],
            type: m['3. type'],
            region: m['4. region'],
        }));
    }

    async getMarketStatus(): Promise<MarketStatus[]> {
        const data = await this.fetch({ function: 'MARKET_STATUS' }, 'market_status');
        if (!data?.markets) return [];

        return data.markets.map((m: any) => ({
            region: m.region,
            marketType: m.market_type,
            primaryExchanges: m.primary_exchanges,
            localOpen: m.local_open,
            localClose: m.local_close,
            currentStatus: m.current_status,
            notes: m.notes,
        }));
    }

    // ============================================
    // ALPHA INTELLIGENCE APIs
    // ============================================

    async getNewsSentiment(tickers?: string, topics?: string, limit = 15): Promise<NewsArticle[]> {
        const params: Record<string, string> = { function: 'NEWS_SENTIMENT' };
        if (tickers) params.tickers = tickers;
        if (topics) params.topics = topics;

        const data = await this.fetch(params, `news_${tickers}_${topics}`);
        if (!data?.feed) return [];

        return data.feed.slice(0, limit).map((item: any) => ({
            title: item.title,
            url: item.url,
            source: item.source,
            summary: item.summary,
            bannerImage: item.banner_image,
            sentiment: item.overall_sentiment_label || 'Neutral',
            sentimentScore: parseFloat(item.overall_sentiment_score) || 0,
            publishedAt: item.time_published,
            tickers: (item.ticker_sentiment || []).map((t: any) => ({
                ticker: t.ticker,
                sentiment: t.ticker_sentiment_label,
                sentimentScore: parseFloat(t.ticker_sentiment_score),
            })),
        }));
    }

    async getTopGainersLosers(): Promise<{ gainers: TopMover[]; losers: TopMover[]; mostActive: TopMover[] }> {
        const data = await this.fetch({ function: 'TOP_GAINERS_LOSERS' }, 'top_movers');
        if (!data) return { gainers: [], losers: [], mostActive: [] };

        const map = (item: any): TopMover => ({
            ticker: item.ticker,
            price: item.price,
            changeAmount: item.change_amount,
            changePercentage: item.change_percentage,
            volume: item.volume,
        });

        return {
            gainers: (data.top_gainers || []).slice(0, 10).map(map),
            losers: (data.top_losers || []).slice(0, 10).map(map),
            mostActive: (data.most_actively_traded || []).slice(0, 10).map(map),
        };
    }

    // ============================================
    // FUNDAMENTAL DATA APIs
    // ============================================

    async getCompanyOverview(symbol: string): Promise<CompanyOverview | null> {
        const data = await this.fetch({ function: 'OVERVIEW', symbol }, `overview_${symbol}`);
        if (!data || !data.Symbol) return null;

        return {
            symbol: data.Symbol,
            name: data.Name,
            description: data.Description,
            exchange: data.Exchange,
            currency: data.Currency,
            country: data.Country,
            sector: data.Sector,
            industry: data.Industry,
            marketCap: parseFloat(data.MarketCapitalization) || 0,
            peRatio: parseFloat(data.PERatio) || 0,
            pegRatio: parseFloat(data.PEGRatio) || 0,
            bookValue: parseFloat(data.BookValue) || 0,
            dividendPerShare: parseFloat(data.DividendPerShare) || 0,
            dividendYield: parseFloat(data.DividendYield) || 0,
            eps: parseFloat(data.EPS) || 0,
            revenuePerShareTTM: parseFloat(data.RevenuePerShareTTM) || 0,
            profitMargin: parseFloat(data.ProfitMargin) || 0,
            operatingMarginTTM: parseFloat(data.OperatingMarginTTM) || 0,
            returnOnAssetsTTM: parseFloat(data.ReturnOnAssetsTTM) || 0,
            returnOnEquityTTM: parseFloat(data.ReturnOnEquityTTM) || 0,
            revenueTTM: parseFloat(data.RevenueTTM) || 0,
            grossProfitTTM: parseFloat(data.GrossProfitTTM) || 0,
            dilutedEPSTTM: parseFloat(data.DilutedEPSTTM) || 0,
            week52High: parseFloat(data['52WeekHigh']) || 0,
            week52Low: parseFloat(data['52WeekLow']) || 0,
            day50MovingAverage: parseFloat(data['50DayMovingAverage']) || 0,
            day200MovingAverage: parseFloat(data['200DayMovingAverage']) || 0,
            sharesOutstanding: parseFloat(data.SharesOutstanding) || 0,
            beta: parseFloat(data.Beta) || 0,
            analystTargetPrice: parseFloat(data.AnalystTargetPrice) || 0,
        };
    }

    async getEarnings(symbol: string): Promise<{ annual: EarningsData[]; quarterly: EarningsData[] }> {
        const data = await this.fetch({ function: 'EARNINGS', symbol }, `earnings_${symbol}`);
        if (!data) return { annual: [], quarterly: [] };

        const mapEarnings = (e: any): EarningsData => ({
            fiscalDateEnding: e.fiscalDateEnding,
            reportedEPS: parseFloat(e.reportedEPS) || 0,
            estimatedEPS: parseFloat(e.estimatedEPS) || 0,
            surprise: parseFloat(e.surprise) || 0,
            surprisePercentage: parseFloat(e.surprisePercentage) || 0,
        });

        return {
            annual: (data.annualEarnings || []).map(mapEarnings),
            quarterly: (data.quarterlyEarnings || []).slice(0, 8).map(mapEarnings),
        };
    }

    // ============================================
    // CRYPTOCURRENCIES APIs
    // ============================================

    async getCryptoExchangeRate(fromCurrency: string, toCurrency = 'USD'): Promise<CryptoQuote | null> {
        const data = await this.fetch(
            { function: 'CURRENCY_EXCHANGE_RATE', from_currency: fromCurrency, to_currency: toCurrency },
            `crypto_rate_${fromCurrency}_${toCurrency}`
        );
        if (!data?.['Realtime Currency Exchange Rate']) return null;

        const r = data['Realtime Currency Exchange Rate'];
        return {
            symbol: fromCurrency,
            name: CRYPTO_NAMES[fromCurrency] || fromCurrency,
            price: parseFloat(r['5. Exchange Rate']),
            bidPrice: parseFloat(r['8. Bid Price'] || r['5. Exchange Rate']),
            askPrice: parseFloat(r['9. Ask Price'] || r['5. Exchange Rate']),
            lastUpdated: r['6. Last Refreshed'],
        };
    }

    async getCryptoDailyTimeSeries(symbol: string, market = 'USD'): Promise<TimeSeriesData[]> {
        const data = await this.fetch(
            { function: 'DIGITAL_CURRENCY_DAILY', symbol, market },
            `crypto_daily_${symbol}_${market}`
        );
        if (!data?.['Time Series (Digital Currency Daily)']) return [];

        return Object.entries(data['Time Series (Digital Currency Daily)']).slice(0, 60).map(([date, v]: [string, any]) => ({
            timestamp: date,
            open: parseFloat(v[`1a. open (${market})`] || v['1. open']),
            high: parseFloat(v[`2a. high (${market})`] || v['2. high']),
            low: parseFloat(v[`3a. low (${market})`] || v['3. low']),
            close: parseFloat(v[`4a. close (${market})`] || v['4. close']),
            volume: parseFloat(v['5. volume'] || 0),
        })).reverse();
    }

    async getCryptoWeeklyTimeSeries(symbol: string, market = 'USD'): Promise<TimeSeriesData[]> {
        const data = await this.fetch(
            { function: 'DIGITAL_CURRENCY_WEEKLY', symbol, market },
            `crypto_weekly_${symbol}_${market}`
        );
        if (!data?.['Time Series (Digital Currency Weekly)']) return [];

        return Object.entries(data['Time Series (Digital Currency Weekly)']).slice(0, 52).map(([date, v]: [string, any]) => ({
            timestamp: date,
            open: parseFloat(v[`1a. open (${market})`] || v['1. open']),
            high: parseFloat(v[`2a. high (${market})`] || v['2. high']),
            low: parseFloat(v[`3a. low (${market})`] || v['3. low']),
            close: parseFloat(v[`4a. close (${market})`] || v['4. close']),
            volume: parseFloat(v['5. volume'] || 0),
        })).reverse();
    }

    async getCryptoMonthlyTimeSeries(symbol: string, market = 'USD'): Promise<TimeSeriesData[]> {
        const data = await this.fetch(
            { function: 'DIGITAL_CURRENCY_MONTHLY', symbol, market },
            `crypto_monthly_${symbol}_${market}`
        );
        if (!data?.['Time Series (Digital Currency Monthly)']) return [];

        return Object.entries(data['Time Series (Digital Currency Monthly)']).slice(0, 24).map(([date, v]: [string, any]) => ({
            timestamp: date,
            open: parseFloat(v[`1a. open (${market})`] || v['1. open']),
            high: parseFloat(v[`2a. high (${market})`] || v['2. high']),
            low: parseFloat(v[`3a. low (${market})`] || v['3. low']),
            close: parseFloat(v[`4a. close (${market})`] || v['4. close']),
            volume: parseFloat(v['5. volume'] || 0),
        })).reverse();
    }

    // ============================================
    // FOREX APIs
    // ============================================

    async getForexDailyRates(fromSymbol: string, toSymbol: string): Promise<TimeSeriesData[]> {
        const data = await this.fetch(
            { function: 'FX_DAILY', from_symbol: fromSymbol, to_symbol: toSymbol },
            `fx_daily_${fromSymbol}_${toSymbol}`
        );
        if (!data?.['Time Series FX (Daily)']) return [];

        return Object.entries(data['Time Series FX (Daily)']).slice(0, 60).map(([date, v]: [string, any]) => ({
            timestamp: date,
            open: parseFloat(v['1. open']),
            high: parseFloat(v['2. high']),
            low: parseFloat(v['3. low']),
            close: parseFloat(v['4. close']),
            volume: 0,
        })).reverse();
    }

    // ============================================
    // COMMODITIES APIs
    // ============================================

    async getCommodityData(commodity: 'WTI' | 'BRENT' | 'NATURAL_GAS' | 'COPPER' | 'ALUMINUM' | 'WHEAT' | 'CORN' | 'COTTON' | 'SUGAR' | 'COFFEE'): Promise<CommodityData[]> {
        const data = await this.fetch({ function: commodity, interval: 'daily' }, `commodity_${commodity}`);
        if (!data?.data) return [];

        return data.data.slice(0, 60).map((d: any) => ({
            date: d.date,
            value: parseFloat(d.value) || 0,
        }));
    }

    async getAllCommodities(): Promise<Record<string, number>> {
        const commodities = ['WTI', 'BRENT', 'NATURAL_GAS', 'COPPER', 'WHEAT', 'CORN'] as const;
        const result: Record<string, number> = {};

        for (const commodity of commodities) {
            const data = await this.getCommodityData(commodity);
            if (data.length > 0) {
                result[commodity] = data[data.length - 1].value;
            }
            await new Promise(r => setTimeout(r, 300));
        }

        return result;
    }

    // ============================================
    // ECONOMIC INDICATORS APIs
    // ============================================

    async getEconomicIndicator(indicator: 'REAL_GDP' | 'REAL_GDP_PER_CAPITA' | 'TREASURY_YIELD' | 'FEDERAL_FUNDS_RATE' | 'CPI' | 'INFLATION' | 'RETAIL_SALES' | 'DURABLES' | 'UNEMPLOYMENT' | 'NONFARM_PAYROLL', interval = 'annual'): Promise<EconomicData[]> {
        const data = await this.fetch({ function: indicator, interval }, `econ_${indicator}_${interval}`);
        if (!data?.data) return [];

        return data.data.slice(0, 20).map((d: any) => ({
            date: d.date,
            value: parseFloat(d.value) || 0,
        }));
    }

    // ============================================
    // TECHNICAL INDICATORS APIs
    // ============================================

    async getRSI(symbol: string, interval = 'daily', timePeriod = 14): Promise<TechnicalIndicator[]> {
        const data = await this.fetch(
            { function: 'RSI', symbol, interval, time_period: timePeriod.toString(), series_type: 'close' },
            `rsi_${symbol}_${interval}_${timePeriod}`
        );
        if (!data?.['Technical Analysis: RSI']) return [];

        return Object.entries(data['Technical Analysis: RSI']).slice(0, 60).map(([ts, v]: [string, any]) => ({
            timestamp: ts,
            value: parseFloat(v.RSI),
        })).reverse();
    }

    async getMACD(symbol: string, interval = 'daily'): Promise<{ timestamp: string; macd: number; signal: number; histogram: number }[]> {
        const data = await this.fetch(
            { function: 'MACD', symbol, interval, series_type: 'close' },
            `macd_${symbol}_${interval}`
        );
        if (!data?.['Technical Analysis: MACD']) return [];

        return Object.entries(data['Technical Analysis: MACD']).slice(0, 60).map(([ts, v]: [string, any]) => ({
            timestamp: ts,
            macd: parseFloat(v.MACD),
            signal: parseFloat(v.MACD_Signal),
            histogram: parseFloat(v.MACD_Hist),
        })).reverse();
    }

    async getSMA(symbol: string, interval = 'daily', timePeriod = 20): Promise<TechnicalIndicator[]> {
        const data = await this.fetch(
            { function: 'SMA', symbol, interval, time_period: timePeriod.toString(), series_type: 'close' },
            `sma_${symbol}_${interval}_${timePeriod}`
        );
        if (!data?.['Technical Analysis: SMA']) return [];

        return Object.entries(data['Technical Analysis: SMA']).slice(0, 60).map(([ts, v]: [string, any]) => ({
            timestamp: ts,
            value: parseFloat(v.SMA),
        })).reverse();
    }

    async getEMA(symbol: string, interval = 'daily', timePeriod = 20): Promise<TechnicalIndicator[]> {
        const data = await this.fetch(
            { function: 'EMA', symbol, interval, time_period: timePeriod.toString(), series_type: 'close' },
            `ema_${symbol}_${interval}_${timePeriod}`
        );
        if (!data?.['Technical Analysis: EMA']) return [];

        return Object.entries(data['Technical Analysis: EMA']).slice(0, 60).map(([ts, v]: [string, any]) => ({
            timestamp: ts,
            value: parseFloat(v.EMA),
        })).reverse();
    }

    async getBBands(symbol: string, interval = 'daily', timePeriod = 20): Promise<{ timestamp: string; upper: number; middle: number; lower: number }[]> {
        const data = await this.fetch(
            { function: 'BBANDS', symbol, interval, time_period: timePeriod.toString(), series_type: 'close' },
            `bbands_${symbol}_${interval}_${timePeriod}`
        );
        if (!data?.['Technical Analysis: BBANDS']) return [];

        return Object.entries(data['Technical Analysis: BBANDS']).slice(0, 60).map(([ts, v]: [string, any]) => ({
            timestamp: ts,
            upper: parseFloat(v['Real Upper Band']),
            middle: parseFloat(v['Real Middle Band']),
            lower: parseFloat(v['Real Lower Band']),
        })).reverse();
    }

    async getADX(symbol: string, interval = 'daily', timePeriod = 14): Promise<TechnicalIndicator[]> {
        const data = await this.fetch(
            { function: 'ADX', symbol, interval, time_period: timePeriod.toString() },
            `adx_${symbol}_${interval}_${timePeriod}`
        );
        if (!data?.['Technical Analysis: ADX']) return [];

        return Object.entries(data['Technical Analysis: ADX']).slice(0, 60).map(([ts, v]: [string, any]) => ({
            timestamp: ts,
            value: parseFloat(v.ADX),
        })).reverse();
    }

    async getSTOCH(symbol: string, interval = 'daily'): Promise<{ timestamp: string; slowK: number; slowD: number }[]> {
        const data = await this.fetch(
            { function: 'STOCH', symbol, interval },
            `stoch_${symbol}_${interval}`
        );
        if (!data?.['Technical Analysis: STOCH']) return [];

        return Object.entries(data['Technical Analysis: STOCH']).slice(0, 60).map(([ts, v]: [string, any]) => ({
            timestamp: ts,
            slowK: parseFloat(v.SlowK),
            slowD: parseFloat(v.SlowD),
        })).reverse();
    }

    async getOBV(symbol: string, interval = 'daily'): Promise<TechnicalIndicator[]> {
        const data = await this.fetch(
            { function: 'OBV', symbol, interval },
            `obv_${symbol}_${interval}`
        );
        if (!data?.['Technical Analysis: OBV']) return [];

        return Object.entries(data['Technical Analysis: OBV']).slice(0, 60).map(([ts, v]: [string, any]) => ({
            timestamp: ts,
            value: parseFloat(v.OBV),
        })).reverse();
    }

    async getATR(symbol: string, interval = 'daily', timePeriod = 14): Promise<TechnicalIndicator[]> {
        const data = await this.fetch(
            { function: 'ATR', symbol, interval, time_period: timePeriod.toString() },
            `atr_${symbol}_${interval}_${timePeriod}`
        );
        if (!data?.['Technical Analysis: ATR']) return [];

        return Object.entries(data['Technical Analysis: ATR']).slice(0, 60).map(([ts, v]: [string, any]) => ({
            timestamp: ts,
            value: parseFloat(v.ATR),
        })).reverse();
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    clearCache(): void {
        this.cache.clear();
    }

    async ping(): Promise<boolean> {
        try {
            const response = await fetch(`${BASE_URL}?function=GLOBAL_QUOTE&symbol=IBM&apikey=${API_KEY}`);
            return response.ok;
        } catch {
            return false;
        }
    }

    // ============================================
    // TOP CRYPTOCURRENCIES
    // ============================================

    async getTopCryptocurrencies(count: number = 10): Promise<{
        rank: number;
        symbol: string;
        name: string;
        price: number;
        color: string;
    }[]> {
        const cryptos = TOP_CRYPTO_SYMBOLS.slice(0, count);
        const results: {
            rank: number;
            symbol: string;
            name: string;
            price: number;
            color: string;
        }[] = [];

        for (let i = 0; i < cryptos.length; i++) {
            const crypto = cryptos[i];
            try {
                const quote = await this.getCryptoExchangeRate(crypto.symbol);
                results.push({
                    rank: i + 1,
                    symbol: crypto.symbol,
                    name: crypto.name,
                    price: quote?.price || 0,
                    color: crypto.color,
                });
            } catch (err) {
                console.warn(`Failed to fetch ${crypto.symbol}:`, err);
                results.push({
                    rank: i + 1,
                    symbol: crypto.symbol,
                    name: crypto.name,
                    price: 0,
                    color: crypto.color,
                });
            }
            // Rate limiting delay
            await new Promise(r => setTimeout(r, 250));
        }

        // Sort by price (highest first) to maintain market cap order approximation
        return results;
    }
}

export const alphaVantage = new AlphaVantageAPI();
export default alphaVantage;
