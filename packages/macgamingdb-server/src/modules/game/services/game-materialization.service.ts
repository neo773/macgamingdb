import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { isDefined } from 'macgamingdb-shared/utils/isDefined';
import { DRIZZLE_CLIENT } from '../../../database/constants/drizzle-client.constant';
import { type DrizzleDB } from '../../../database/drizzle';
import { games, gameAliases, gameSourceLinks } from '../../../database/schema';
import { GAME_SOURCES } from '../constants/game-sources.constant';
import type { GameSource } from '../types/game-source.type';
import type { NormalizedGameDetails } from '../types/normalized-game-details.type';
import type { GameSourceDriver } from '../interfaces/game-source-driver.interface';
import { SteamGameSourceService } from '../drivers/steam/services/steam-game-source.service';
import { IgdbGameSourceService } from '../drivers/igdb/services/igdb-game-source.service';
import { generateUniqueGameSlug } from '../utils/generate-unique-game-slug.util';
import { parseGameRef } from '../utils/parse-game-ref.util';
import { GameException } from '../exceptions/game.exception';

type GameRow = typeof games.$inferSelect;

const gameColumnsFromDetails = (details: NormalizedGameDetails) => ({
  name: details.name,
  headerImage: details.headerImage,
  descriptionHtml: details.descriptionHtml,
  website: details.website,
  releaseDate: details.releaseDate,
  releaseYear: details.releaseYear,
  developers: details.developers,
  publishers: details.publishers,
  genres: details.genres,
  screenshots: details.screenshots,
});

@Injectable()
export class GameMaterializationService {
  constructor(
    @Inject(DRIZZLE_CLIENT) private readonly db: DrizzleDB,
    private readonly steamGameSourceService: SteamGameSourceService,
    private readonly igdbGameSourceService: IgdbGameSourceService,
  ) {}

  async resolveGame({
    identifier,
  }: {
    identifier: string;
  }): Promise<GameRow | null> {
    const bySlug = await this.db.query.games.findFirst({
      where: eq(games.slug, identifier),
    });
    if (bySlug) {
      return bySlug;
    }

    const alias = await this.db.query.gameAliases.findFirst({
      where: eq(gameAliases.aliasId, identifier),
    });
    if (alias) {
      const canonical = await this.db.query.games.findFirst({
        where: eq(games.id, alias.canonicalId),
      });
      if (canonical) {
        return canonical;
      }
    }

    const ref = parseGameRef(identifier);
    if (ref) {
      const link = await this.db.query.gameSourceLinks.findFirst({
        where: and(
          eq(gameSourceLinks.source, ref.source),
          eq(gameSourceLinks.externalId, ref.externalId),
        ),
        with: { game: true },
      });
      if (link?.game) {
        return link.game;
      }
    }

    const byId = await this.db.query.games.findFirst({
      where: eq(games.id, identifier),
    });
    return byId ?? null;
  }

  async materializeGame({
    source,
    externalId,
  }: {
    source: GameSource;
    externalId: string;
  }): Promise<GameRow | null> {
    const existing = await this.findGameByLink({ source, externalId });
    if (existing?.name) {
      return existing;
    }

    let details: NormalizedGameDetails | null;
    try {
      details = await this.gameSourceDriverFor(source).fetchGame({
        externalId,
      });
    } catch (error) {
      console.error(`${source} fetch for ${externalId} failed:`, error);
      details = null;
    }
    if (!details) {
      return existing;
    }

    // A game that exists on Steam is canonically the Steam entry, whichever
    // source it was discovered through.
    if (source !== 'steam' && details.externalIds.steam) {
      const canonical = await this.materializeGame({
        source: 'steam',
        externalId: details.externalIds.steam,
      });
      if (canonical) {
        await this.linkGame({
          gameId: canonical.id,
          externalIds: details.externalIds,
        });
        return canonical;
      }
    }

    const gameId = existing?.id ?? createId();
    const slug =
      existing?.slug ??
      (await this.assignGameSlug({
        name: details.name,
        releaseYear: details.releaseYear ?? undefined,
        fallbackId: externalId,
      }));

    await this.db
      .insert(games)
      .values({ id: gameId, slug, ...gameColumnsFromDetails(details) })
      .onConflictDoUpdate({
        target: games.id,
        set: gameColumnsFromDetails(details),
      });
    await this.linkGame({ gameId, externalIds: details.externalIds });

    // A concurrent materialization may have won the link insert; return the
    // winning row and discard this call's orphaned one.
    const persisted = await this.findGameByLink({ source, externalId });
    if (persisted && persisted.id !== gameId && !existing) {
      await this.db.delete(games).where(eq(games.id, gameId));
    }
    return persisted;
  }

  private gameSourceDriverFor(source: GameSource): GameSourceDriver {
    switch (source) {
      case 'steam':
        return this.steamGameSourceService;
      case 'igdb':
        return this.igdbGameSourceService;
      default:
        throw new GameException(
          `Unknown game source: ${source}`,
          'GAME_SOURCE_UNKNOWN',
        );
    }
  }

  private async findGameByLink({
    source,
    externalId,
  }: {
    source: GameSource;
    externalId: string;
  }): Promise<GameRow | null> {
    const link = await this.db.query.gameSourceLinks.findFirst({
      where: and(
        eq(gameSourceLinks.source, source),
        eq(gameSourceLinks.externalId, externalId),
      ),
      with: { game: true },
    });
    return link?.game ?? null;
  }

  private async linkGame({
    gameId,
    externalIds,
  }: {
    gameId: string;
    externalIds: NormalizedGameDetails['externalIds'];
  }): Promise<void> {
    for (const source of GAME_SOURCES) {
      const externalId = externalIds[source];
      if (!externalId) {
        continue;
      }
      await this.db
        .insert(gameSourceLinks)
        .values({ gameId, source, externalId })
        .onConflictDoNothing();
    }
  }

  private async assignGameSlug({
    name,
    releaseYear,
    fallbackId,
  }: {
    name: string;
    releaseYear?: number;
    fallbackId: string;
  }): Promise<string> {
    return generateUniqueGameSlug({
      name,
      releaseYear,
      fallbackId,
      isTaken: async (candidate) => {
        const [row] = await this.db
          .select({ id: games.id })
          .from(games)
          .where(eq(games.slug, candidate))
          .limit(1);
        return isDefined(row);
      },
    });
  }
}
