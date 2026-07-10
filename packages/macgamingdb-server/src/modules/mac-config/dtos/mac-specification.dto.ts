import { z } from 'zod';

export const MacSpecificationSchema = z.object({
  family: z.string(),
  model: z.string(),
  identifier: z.string(),
  chip: z.string(),
  chipVariant: z.string(),
  cpuCores: z.number(),
  gpuCores: z.number(),
  ram: z.number(),
  year: z.number(),
});

export type MacSpecification = z.infer<typeof MacSpecificationSchema>;
