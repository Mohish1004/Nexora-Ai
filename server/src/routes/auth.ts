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

router.post('/phone', (req, res) => {
  const { phoneNumber, idToken } = req.body;
  res.json({
    success: true,
    message: 'Phone Authentication successful',
    data: {
      accessToken: 'mock-phone-access-token',
      refreshToken: 'mock-phone-refresh-token',
      email: (phoneNumber || 'phone-user') + '@nexora.phone',
      fullName: 'Phone User (' + (phoneNumber || 'Unspecified') + ')',
      role: 'USER',
      planType: 'FREE',
    },
  });
});

router.post('/apple', (req, res) => {
  const { email, fullName, idToken } = req.body;
  res.json({
    success: true,
    message: 'Apple Authentication successful',
    data: {
      accessToken: 'mock-apple-access-token',
      refreshToken: 'mock-apple-refresh-token',
      email: email || 'apple-user@nexora.ai',
      fullName: fullName || 'Apple User',
      role: 'USER',
      planType: 'FREE',
    },
  });
});

export default router;
