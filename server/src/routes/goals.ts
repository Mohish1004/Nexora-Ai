import { Router } from 'express';
import type { Goal } from '../types.js';
import { seedGoals } from '../data/seed.js';

const router = Router();

let goals: Goal[] = [...seedGoals];

router.get('/', (_req, res) => {
  res.json(goals);
});

router.post('/', (req, res) => {
  const data = req.body;
  const newGoal: Goal = {
    ...data,
    id: `g${goals.length + 1}`,
  };
  goals.push(newGoal);
  res.status(201).json(newGoal);
});

router.put('/:id/save', (req, res) => {
  const idx = goals.findIndex(g => g.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: 'Not found' }); return; }

  const { amount } = req.body;
  const g = goals[idx];
  g.currentAmount = Math.min(g.targetAmount, g.currentAmount + (amount || 0));
  res.json(goals[idx]);
});

export default router;
