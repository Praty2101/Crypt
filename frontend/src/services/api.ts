/**
 * API Service for Crypt Trading Platform
 * Handles all communication with the FastAPI backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
}

class ApiService {
    private baseUrl: string;
    private token: string | null = null;

    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    setToken(token: string) {
        this.token = token;
    }

    clearToken() {
        this.token = null;
    }

    private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { method = 'GET', body, headers = {} } = options;

        const config: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { Authorization: `Bearer ${this.token}` }),
                ...headers,
            },
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, config);

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
            throw new Error(error.detail || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    // ========== Market Data ==========

    async getMarketOverview() {
        return this.request('/market/overview');
    }

    async getStockQuote(symbol: string) {
        return this.request(`/market/stocks/${symbol}`);
    }

    async getCryptoQuote(symbol: string) {
        return this.request(`/market/crypto/${symbol}`);
    }

    async getStockHistory(symbol: string, interval = '1d', period = '1mo') {
        return this.request(`/market/stocks/${symbol}/history?interval=${interval}&period=${period}`);
    }

    async getCryptoHistory(symbol: string, days = 30) {
        return this.request(`/market/crypto/${symbol}/history?days=${days}`);
    }

    async searchAssets(query: string, assetType?: string) {
        const params = new URLSearchParams({ query });
        if (assetType) params.append('asset_type', assetType);
        return this.request(`/market/search?${params}`);
    }

    // ========== Predictions ==========

    async getPrediction(symbol: string, horizon = '1d') {
        return this.request(`/predictions/asset/${symbol}?horizon=${horizon}`);
    }

    async getBulkPredictions(symbols: string[], horizon = '1d') {
        return this.request('/predictions/bulk', {
            method: 'POST',
            body: { symbols, horizon },
        });
    }

    async getTopPicks(options?: {
        assetType?: string;
        direction?: string;
        minConfidence?: number;
        limit?: number;
    }) {
        const params = new URLSearchParams();
        if (options?.assetType) params.append('asset_type', options.assetType);
        if (options?.direction) params.append('direction', options.direction);
        if (options?.minConfidence) params.append('min_confidence', options.minConfidence.toString());
        if (options?.limit) params.append('limit', options.limit.toString());
        return this.request(`/predictions/top-picks?${params}`);
    }

    async getPredictionModels() {
        return this.request('/predictions/models');
    }

    // ========== AI Agents ==========

    async chatWithAgents(message: string, context?: any, sessionId?: string) {
        return this.request('/agents/chat', {
            method: 'POST',
            body: { message, context, session_id: sessionId },
        });
    }

    async analyzeAsset(symbol: string, analysisType = 'comprehensive', timeHorizon = 'medium') {
        return this.request(`/agents/analyze/${symbol}`, {
            method: 'POST',
            body: { symbol, analysis_type: analysisType, time_horizon: timeHorizon },
        });
    }

    async getAgentsList() {
        return this.request('/agents/agents');
    }

    async askSpecificAgent(agentId: string, question: string) {
        return this.request(`/agents/agents/${agentId}/ask?question=${encodeURIComponent(question)}`);
    }

    async getDailySuggestions(riskProfile = 'balanced') {
        return this.request(`/agents/suggestions?risk_profile=${riskProfile}`);
    }

    async getMarketBrief() {
        return this.request('/agents/market-brief');
    }

    // ========== Portfolio ==========

    async getPortfolioSummary() {
        return this.request('/portfolio/summary');
    }

    async getHoldings(assetType?: string) {
        const params = assetType ? `?asset_type=${assetType}` : '';
        return this.request(`/portfolio/holdings${params}`);
    }

    async addHolding(data: {
        symbol: string;
        quantity: number;
        purchasePrice: number;
        purchaseDate?: string;
        notes?: string;
    }) {
        return this.request('/portfolio/holdings', {
            method: 'POST',
            body: {
                symbol: data.symbol,
                quantity: data.quantity,
                purchase_price: data.purchasePrice,
                purchase_date: data.purchaseDate,
                notes: data.notes,
            },
        });
    }

    async removeHolding(symbol: string) {
        return this.request(`/portfolio/holdings/${symbol}`, {
            method: 'DELETE',
        });
    }

    async getTransactions(symbol?: string, limit = 50) {
        const params = new URLSearchParams({ limit: limit.toString() });
        if (symbol) params.append('symbol', symbol);
        return this.request(`/portfolio/transactions?${params}`);
    }

    async getPortfolioPerformance(period = '1m') {
        return this.request(`/portfolio/performance?period=${period}`);
    }

    async getPortfolioAnalytics() {
        return this.request('/portfolio/analytics');
    }

    async getRebalanceSuggestions(targetStrategy = 'balanced') {
        return this.request(`/portfolio/rebalance-suggestions?target_strategy=${targetStrategy}`);
    }

    async getWatchlist() {
        return this.request('/portfolio/watchlist');
    }

    async addToWatchlist(symbol: string) {
        return this.request(`/portfolio/watchlist/${symbol}`, {
            method: 'POST',
        });
    }

    async removeFromWatchlist(symbol: string) {
        return this.request(`/portfolio/watchlist/${symbol}`, {
            method: 'DELETE',
        });
    }

    // ========== Authentication ==========

    async login(email: string, password: string) {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await fetch(`${this.baseUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        this.setToken(data.access_token);
        return data;
    }

    async register(email: string, password: string, name: string) {
        return this.request('/auth/register', {
            method: 'POST',
            body: { email, password, name },
        });
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    async refreshToken() {
        const data = await this.request<{ access_token: string }>('/auth/refresh', {
            method: 'POST',
        });
        this.setToken(data.access_token);
        return data;
    }

    async logout() {
        this.clearToken();
        return this.request('/auth/logout', { method: 'POST' });
    }
}

// Export singleton instance
export const api = new ApiService();
export default api;
