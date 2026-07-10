import { Inject } from '@nestjs/common';
import { z } from 'zod';
import { Input, Query, Router } from 'nestjs-trpc';
import { ContributorDetailSchema } from '../dtos/contributor-detail.dto';
import { ContributorsPageSchema } from '../dtos/contributors-page.dto';
import { ContributorService } from '../services/contributor.service';

@Router({ alias: 'contributor' })
export class ContributorRouter {
  constructor(
    @Inject(ContributorService)
    private readonly contributorService: ContributorService,
  ) {}

  @Query({
    input: z.object({ id: z.string() }),
    output: ContributorDetailSchema,
    meta: {
      openapi: { method: 'GET', path: '/contributors/{id}', protect: false, tags: ['contributors'] },
    },
  })
  async getById(@Input('id') id: string) {
    return this.contributorService.getById(id);
  }

  @Query({
    input: z.object({
      limit: z.number().min(1).max(50).default(10),
      cursor: z.number().int().min(0).nullish(),
    }),
    output: ContributorsPageSchema,
    meta: {
      openapi: { method: 'GET', path: '/contributors', protect: false, tags: ['contributors'] },
    },
  })
  async getTopContributors(
    @Input() input: { limit: number; cursor?: number | null },
  ) {
    return this.contributorService.getTopContributors(input);
  }
}
