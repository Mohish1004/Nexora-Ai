import { Router } from 'express';
import type { OCRResult } from '../types.js';

const router = Router();

router.post('/scan', (req, res) => {
  const fileName = (req.body?.fileName || '').toLowerCase();

  // Simulate OCR processing delay
  let result: OCRResult;
  if (fileName.includes('aws') || fileName.includes('amazon')) {
    result = {
      vendor: 'Amazon Web Services',
      amount: 24500,
      date: new Date().toISOString().split('T')[0],
      category: 'Bills',
      detectedItems: ['EC2 Instances', 'S3 Storage', 'CloudFront Data Transfer'],
    };
  } else if (fileName.includes('swiggy') || fileName.includes('zomato') || fileName.includes('food')) {
    result = {
      vendor: 'Swiggy Premium',
      amount: 1850,
      date: new Date().toISOString().split('T')[0],
      category: 'Food',
      detectedItems: ['Healthy Salad Box', 'Fresh Orange Juice'],
    };
  } else {
    result = {
      vendor: 'Uber Rides Inc',
      amount: 1200,
      date: new Date().toISOString().split('T')[0],
      category: 'Travel',
      detectedItems: ['Corporate Travel Ride', 'Base Fare Premium'],
    };
  }

  res.json(result);
});

export default router;
