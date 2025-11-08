import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

export interface StatsData {
  totalSpend: number;
  totalInvoices: number;
  totalDocuments: number;
  averageInvoiceValue: number;
}

export interface InvoiceTrend {
  month: string;
  volume: number;
  value: number;
}

export interface VendorData {
  vendorName: string;
  totalSpend: number;
}

export interface CategorySpend {
  category: string;
  spend: number;
}

export interface CashOutflow {
  month: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceId: string;
  vendor: string;
  date: string;
  amount: number;
  status: string;
  customer?: string;
}

export interface ChatResponse {
  query: string;
  sql: string;
  results: Record<string, unknown>[];
  explanation: string;
  rowCount: number;
}

class ApiService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });

  constructor() {
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.message);
        throw error;
      }
    );
  }

  getStats = async (): Promise<StatsData> => {
    try {
      const response = await this.api.get('/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      throw error;
    }
  }

  getInvoiceTrends = async (): Promise<InvoiceTrend[]> => {
    const response = await this.api.get('/invoice-trends');
    return response.data;
  }

  getTopVendors = async (): Promise<VendorData[]> => {
    const response = await this.api.get('/vendors/top10');
    return response.data;
  }

  getCategorySpend = async (): Promise<CategorySpend[]> => {
    const response = await this.api.get('/category-spend');
    return response.data;
  }

  getCashOutflow = async (): Promise<CashOutflow[]> => {
    const response = await this.api.get('/cash-outflow');
    return response.data;
  }

  getInvoices = async (page: number = 1, limit: number = 10, search?: string): Promise<{
    invoices: Invoice[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      params.append('search', search);
    }
    const response = await this.api.get(`/invoices?${params}`);
    return response.data;
  }

  chatWithData = async (query: string): Promise<ChatResponse> => {
    const response = await this.api.post('/chat-with-data', { query });
    return response.data;
  }
}

export const apiService = new ApiService();