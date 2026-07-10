import {
  type PlayMethod,
  type TranslationLayer,
  type Performance,
  type GraphicsSettings,
} from 'macgamingdb-server/schema';

export type ReviewFormData = {
  fps: string;
  resolution: string;
  notes: string;
  screenshots: string[];
  softwareVersion: string;
  playMethod: PlayMethod;
  translationLayer: TranslationLayer;
  performance: Performance;
  graphicsSettings: GraphicsSettings;
  macConfigIdentifier: string;
};
