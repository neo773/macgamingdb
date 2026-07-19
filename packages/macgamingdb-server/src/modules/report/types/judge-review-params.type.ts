export type JudgeReviewParams = {
  game: {
    name: string;
    developers?: string[];
    publishers?: string[];
    genres?: string[];
    releaseYear?: number;
    website?: string;
  };
  review: {
    playMethod: string;
    translationLayer?: string;
    performance: string;
    fps?: number;
    graphicsSettings?: string;
    resolution?: string;
    chipset: string;
    chipsetVariant: string;
    softwareVersion?: string;
    notes?: string;
  };
  reportReason?: string;
};
