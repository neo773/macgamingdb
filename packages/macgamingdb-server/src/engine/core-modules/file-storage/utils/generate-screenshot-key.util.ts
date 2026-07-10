type GenerateScreenshotKeyParams = {
  userId: string;
  gameId: string;
  filename: string;
};

export const generateScreenshotKey = ({
  userId,
  gameId,
  filename,
}: GenerateScreenshotKeyParams): string => {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `screenshots/${userId}/${gameId}/${timestamp}_${sanitizedFilename}`;
};
