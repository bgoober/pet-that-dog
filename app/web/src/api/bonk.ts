import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Handle the bonk action (visual only)
    res.status(200).json({
      label: 'Bonk',
      icon: '🔨',
      description: 'Bonk the dog',
      tx: `BONK_${Date.now()}` // Mock transaction for visual-only action
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process bonk action' });
  }
} 