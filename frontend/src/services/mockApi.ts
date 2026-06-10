import { api } from './api';

export interface OCRResult {
  vendor: string;
  amount: number;
  date: string;
  category: string;
  detectedItems: string[];
}

export const mockApi = {
  scanReceipt: async (file: File): Promise<OCRResult> => {
    return api.scanReceipt(file.name);
  },

  getInventoryForecast: (productId: string) => {
    return api.getInventoryForecast(productId);
  },

  runSaaSContractAudit: () => {
    return api.runSaaSContractAudit();
  },
};
