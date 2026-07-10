export type ReviewFormProps = {
  gameId: string;
  gameName: string;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  isDrawer?: boolean;
};
