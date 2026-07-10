type IgdbImageSize =
  | 't_cover_big'
  | 't_screenshot_big'
  | 't_720p'
  | 't_1080p';

export const igdbImageUrl = ({
  imageId,
  size = 't_cover_big',
}: {
  imageId: string;
  size?: IgdbImageSize;
}): string =>
  `https://images.igdb.com/igdb/image/upload/${size}/${imageId}.jpg`;
