import { Router } from 'express';
import type { User } from '../types.js';

const router = Router();

const DEMO_USER: User = {
  name: 'Sarah Connor',
  email: 'ceo@nexora.ai',
  workspaceMode: 'both',
};

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }
  res.json({ user: DEMO_USER });
});

router.post('/register', (req, res) => {
  const { name, email, workspaceMode } = req.body;
  res.json({
    user: {
      name: name || 'Executive Director',
      email: email || 'ceo@nexora.ai',
      workspaceMode: workspaceMode || 'both',
    },
  });
});

export default router;
