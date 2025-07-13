import { Request, Response } from 'express';
import crypto from 'crypto';

export const generateAccessCode = (req: Request, res: Response) => {
  const code = crypto.randomBytes(3).toString('hex').toUpperCase(); // Generate a 6-character hex code
  // In a real application, you would store this code in a database
  // and associate it with a new Ably channel or session.
  console.log(`Generated access code: ${code}`);
  res.json({ code });
};