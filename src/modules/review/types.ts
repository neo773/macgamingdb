import {
  type PlayMethod,
  type TranslationLayer,
  type Performance,
  type GraphicsSettings,
} from '@macgamingdb/server/schema';

export interface ReviewFormData {
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
}

export interface ReviewFormProps {
  gameId: string;
  gameName: string;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  isDrawer?: boolean;
}
