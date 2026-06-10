import { Router } from 'express';
import type { Product } from '../types.js';
import { seedInventory } from '../data/seed.js';

const router = Router();

let inventory: Product[] = [...seedInventory];

function computeStatus(stock: number, minStock: number): Product['status'] {
  if (stock === 0) return 'Out of Stock';
  if (stock <= minStock) return 'Low Stock';
  return 'In Stock';
}

router.get('/', (_req, res) => {
  res.json(inventory);
});

router.post('/', (req, res) => {
  const data = req.body;
  const newProduct: Product = {
    ...data,
    id: `p${inventory.length + 1}`,
    status: computeStatus(data.stock, data.minStock),
  };
  inventory.push(newProduct);
  res.status(201).json(newProduct);
});

router.put('/:id', (req, res) => {
  const idx = inventory.findIndex(p => p.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: 'Not found' }); return; }
  const merged = { ...inventory[idx], ...req.body };
  merged.status = computeStatus(merged.stock, merged.minStock);
  inventory[idx] = merged;
  res.json(merged);
});

router.delete('/:id', (req, res) => {
  const idx = inventory.findIndex(p => p.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: 'Not found' }); return; }
  inventory.splice(idx, 1);
  res.json({ success: true });
});

export default router;
