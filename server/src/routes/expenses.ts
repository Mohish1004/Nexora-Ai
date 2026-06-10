import { Router } from 'express';
import type { Expense } from '../types.js';
import { seedExpenses } from '../data/seed.js';

const router = Router();

let expenses: Expense[] = [...seedExpenses];

router.get('/', (_req, res) => {
  res.json(expenses);
});

router.post('/', (req, res) => {
  const data = req.body;
  const newExpense: Expense = {
    ...data,
    id: `e${expenses.length + 1}`,
  };
  expenses.push(newExpense);
  res.status(201).json(newExpense);
});

export default router;
