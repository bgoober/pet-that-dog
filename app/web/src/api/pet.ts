import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Handle the pet action
    res.status(200).json({
      label: 'Pet',
      icon: '🐕',
      description: 'Pet the dog',
      tx: req.body.tx // Return the transaction signature from the pet instruction
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process pet action' });
  }
} 