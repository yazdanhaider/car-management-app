import { z } from 'zod';

export const carSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  images: z.array(z.string()).min(1, 'At least one image is required').max(10, 'Maximum 10 images allowed'),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
}); 