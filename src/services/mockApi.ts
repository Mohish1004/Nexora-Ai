export interface OCRResult {
  vendor: string;
  amount: number;
  date: string;
  category: string;
  detectedItems: string[];
}

export const mockApi = {
  // Simulate OCR Scan with 3 stages: Scanning -> Categorizing -> Analyzing
  scanReceipt: async (file: File): Promise<OCRResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock standard response based on some keyword in name
        const name = file.name.toLowerCase();
        if (name.includes('aws') || name.includes('amazon')) {
          resolve({
            vendor: 'Amazon Web Services',
            amount: 24500,
            date: new Date().toISOString().split('T')[0],
            category: 'Bills',
            detectedItems: ['EC2 Instances', 'S3 Storage', 'CloudFront Data Transfer'],
          });
        } else if (name.includes('swiggy') || name.includes('zomato') || name.includes('food')) {
          resolve({
            vendor: 'Swiggy Premium',
            amount: 1850,
            date: new Date().toISOString().split('T')[0],
            category: 'Food',
            detectedItems: ['Healthy Salad Box', 'Fresh Orange Juice'],
          });
        } else {
          resolve({
            vendor: 'Uber Rides Inc',
            amount: 1200,
            date: new Date().toISOString().split('T')[0],
            category: 'Travel',
            detectedItems: ['Corporate Travel Ride', 'Base Fare Premium'],
          });
        }
      }, 2000); // 2 seconds latency to show animation
    });
  },

  // Simulates an AI inventory/runway forecast
  getInventoryForecast: (productId: string) => {
    // Generate simulated stock levels for the next 6 weeks
    const points = [];
    const baseStock = productId === 'p2' ? 3 : productId === 'p4' ? 0 : 15;
    for (let i = 0; i <= 6; i++) {
      points.push({
        week: `Wk ${i}`,
        projectedStock: Math.max(0, Math.round(baseStock - (i * (Math.random() * 2 + 1)) + (i === 3 ? 10 : 0))), // Simulated stock consumption & restock
      });
    }
    return points;
  },

  // Simulates AI SaaS audit anomaly detection
  runSaaSContractAudit: () => {
    return [
      { id: 1, issue: 'Duplicate Hosting Spend', description: 'AWS account is billed twice for development instances.', severity: 'critical', saving: '₹18,000/mo' },
      { id: 2, issue: 'Unused Figma Seats', description: '5 design team licenses have had zero activity for 60 days.', severity: 'warning', saving: '₹8,500/mo' },
      { id: 3, issue: 'Premium Zoom Tier Overlap', description: 'WeWork plan includes free corporate rooms, but separate Zoom room subscriptions are active.', severity: 'info', saving: '₹4,000/mo' },
    ];
  }
};
