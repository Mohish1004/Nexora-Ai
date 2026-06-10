import { Router } from 'express';
import { seedVendors } from '../data/seed.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json(seedVendors);
});

export default router;
