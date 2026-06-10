import { Router } from 'express';
import { seedCustomers } from '../data/seed.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json(seedCustomers);
});

export default router;
