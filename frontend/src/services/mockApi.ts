export interface OCRResult {
  vendor: string;
  amount: number;
  date: string;
  category: string;
  detectedItems: string[];
}

export const mockApi = {
  scanReceipt: async (_file: File): Promise<OCRResult> => {
    await new Promise(r => setTimeout(r, 800));
    return {
      vendor: 'Sample Vendor',
      amount: 2500,
      date: new Date().toISOString().split('T')[0],
      category: 'Food & Dining',
      detectedItems: ['Item 1', 'Item 2'],
    };
  },

  getInventoryForecast: (_productId: string) => {
    const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'];
    return Promise.resolve(weeks.map((week, i) => ({
      week,
      projectedStock: Math.max(0, 100 - i * 7 + Math.floor(Math.random() * 10)),
    })));
  },

  runSaaSContractAudit: () =>
    Promise.resolve({ status: 'ok', message: 'Audit complete — no anomalies detected.' }),
};
