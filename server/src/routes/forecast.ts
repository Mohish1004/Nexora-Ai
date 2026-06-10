import { Router } from 'express';

const router = Router();

router.get('/:productId', (req, res) => {
  const { productId } = req.params;
  const points = [];
  const baseStock = productId === 'p2' ? 3 : productId === 'p4' ? 0 : 15;
  for (let i = 0; i <= 6; i++) {
    points.push({
      week: `Wk ${i}`,
      projectedStock: Math.max(0, Math.round(baseStock - (i * (Math.random() * 2 + 1)) + (i === 3 ? 10 : 0))),
    });
  }
  res.json(points);
});

export default router;
