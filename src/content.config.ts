import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const catatan = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/catatan' }),
  schema: z
    .object({
      title: z.string().min(3).max(100),
      summary: z.string().min(20).max(160),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      tags: z
        .array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/))
        .min(1)
        .max(3),
      draft: z.boolean().default(false),
    })
    .refine((data) => !data.updated || data.updated >= data.date, {
      message: 'updated tidak boleh lebih awal dari date',
      path: ['updated'],
    }),
});

export const collections = { catatan };
