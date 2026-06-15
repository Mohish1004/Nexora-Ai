import { Router } from 'express';
import type { User } from '../types.js';

const router = Router();

const DEMO_USER: User = {
  name: 'Sarah Connor',
  email: 'ceo@nexora.ai',
  role: 'Standard User',
  accountBalance: 0,
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
      name: name || 'New User',
      email: email || 'user@nexora.ai',
      role: 'Standard User',
      accountBalance: 0,
      workspaceMode: workspaceMode || 'business',
    },
  });
});

router.post('/google', (req, res) => {
  const { email, fullName, idToken } = req.body;
  res.json({
    success: true,
    message: 'Google Authentication successful',
    data: {
      accessToken: 'mock-google-access-token',
      refreshToken: 'mock-google-refresh-token',
      email: email || 'google-user@nexora.ai',
      fullName: fullName || 'Google User',
      role: 'USER',
      planType: 'FREE',
    },
  });
});

export default router;
