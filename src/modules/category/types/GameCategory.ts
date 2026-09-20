import { type Chipset, type PlayMethod } from 'macgamingdb-server/schema';
import { type CanonicalGenre } from 'macgamingdb-shared/types/CanonicalGenre';

export type GameCategory = {
  metaTitle: string;
  metaDescription: string;
  heading: string;
  subheading: string;
  introduction: string;
  chipset?: Chipset;
  playMethod?: PlayMethod;
  genre?: CanonicalGenre;
};
