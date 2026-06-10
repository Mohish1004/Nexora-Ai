import { Router } from 'express';

const router = Router();

router.post('/audit', (_req, res) => {
  res.json([
    { id: 1, issue: 'Duplicate Hosting Spend', description: 'AWS account is billed twice for development instances.', severity: 'critical', saving: '₹18,000/mo' },
    { id: 2, issue: 'Unused Figma Seats', description: '5 design team licenses have had zero activity for 60 days.', severity: 'warning', saving: '₹8,500/mo' },
    { id: 3, issue: 'Premium Zoom Tier Overlap', description: 'WeWork plan includes free corporate rooms, but separate Zoom room subscriptions are active.', severity: 'info', saving: '₹4,000/mo' },
  ]);
});

export default router;
