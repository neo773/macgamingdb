import { type PlayMethodSummary } from '@/modules/game/types/PlayMethodSummary';

export type MacVerdict =
  | { confidence: 'none' }
  | {
      confidence: 'confident';
      reportCount: number;
      methods: PlayMethodSummary[];
      chips: string[];
    }
  | {
      confidence: 'thin';
      thinReason: 'tooFewReports' | 'missingSpecs';
      reportCount: number;
      methods: PlayMethodSummary[];
      chips: string[];
    };
