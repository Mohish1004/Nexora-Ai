import { Router } from 'express';
import { seedPayables } from '../data/seed.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json(seedPayables);
});

export default router;
