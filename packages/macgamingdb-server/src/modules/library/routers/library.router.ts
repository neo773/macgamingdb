import { Inject } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { Ctx, Mutation, Query, Router, UseMiddlewares } from 'nestjs-trpc';
import { AuthMiddleware } from '../../../engine/api/trpc/auth.middleware';
import {
  LibraryEntrySchema,
  LibraryLinkUrlSchema,
  LibraryStatusSchema,
  LibrarySyncResultSchema,
  OkResultSchema,
} from '../../../schema/openapi';
import { LibraryService } from '../services/library.service';

type SessionContext = { user?: { user?: { id?: string } } | null };

const requireUserId = (ctx: SessionContext): string => {
  const userId = ctx.user?.user?.id;
  if (!userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Missing authorization',
    });
  }
  return userId;
};

@Router({ alias: 'library' })
export class LibraryRouter {
  constructor(
    @Inject(LibraryService) private readonly libraryService: LibraryService,
  ) {}

  @UseMiddlewares(AuthMiddleware)
  @Query({
    input: z.void(),
    output: LibraryLinkUrlSchema,
    meta: {
      openapi: { method: 'GET', path: '/library/link-url', protect: true, tags: ['library'] },
    },
  })
  async linkStartUrl(@Ctx() ctx: SessionContext) {
    return this.libraryService.linkStartUrl(requireUserId(ctx));
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    input: z.void(),
    output: LibraryStatusSchema,
    meta: {
      openapi: { method: 'GET', path: '/library/status', protect: true, tags: ['library'] },
    },
  })
  async status(@Ctx() ctx: SessionContext) {
    return this.libraryService.status(requireUserId(ctx));
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: z.void(),
    output: LibrarySyncResultSchema,
    meta: {
      openapi: { method: 'POST', path: '/library/sync', protect: true, tags: ['library'] },
    },
  })
  async sync(@Ctx() ctx: SessionContext) {
    return this.libraryService.sync(requireUserId(ctx));
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    input: z.void(),
    output: z.array(LibraryEntrySchema),
    meta: {
      openapi: { method: 'GET', path: '/library', protect: true, tags: ['library'] },
    },
  })
  async list(@Ctx() ctx: SessionContext) {
    return this.libraryService.list(requireUserId(ctx));
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: z.void(),
    output: OkResultSchema,
    meta: {
      openapi: { method: 'DELETE', path: '/library/link', protect: true, tags: ['library'] },
    },
  })
  async unlink(@Ctx() ctx: SessionContext) {
    return this.libraryService.unlink(requireUserId(ctx));
  }
}
