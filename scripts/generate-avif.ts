/**
 * Encodes an AVIF sibling for every raster image under public/images.
 *
 * The Picture component emits <source srcSet="...avif"> derived from the image
 * src. A <picture> does NOT fall back to its <img> when the chosen <source>
 * 404s, so a raster image without an AVIF sibling renders broken. This script
 * generates the missing siblings; --check fails instead of writing, so CI can
 * enforce the invariant without needing an encoder installed.
 *
 * Usage: bun run scripts/generate-avif.ts [--check]
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const IMAGES_DIRECTORY = 'public/images';
const RASTER_EXTENSIONS = ['.png', '.jpg', '.jpeg'];
const AVIF_QUALITY = '50';
const AVIF_SPEED = '4';

const isCheckOnly = process.argv.includes('--check');

const collectRasterImages = (directory: string): string[] =>
  readdirSync(directory).flatMap((entry) => {
    const entryPath = join(directory, entry);

    if (statSync(entryPath).isDirectory()) {
      return collectRasterImages(entryPath);
    }

    return RASTER_EXTENSIONS.includes(extname(entryPath).toLowerCase())
      ? [entryPath]
      : [];
  });

const toAvifPath = (imagePath: string): string =>
  imagePath.slice(0, -extname(imagePath).length) + '.avif';

const rasterImages = collectRasterImages(IMAGES_DIRECTORY);
const missing = rasterImages.filter(
  (imagePath) => !existsSync(toAvifPath(imagePath)),
);

if (missing.length === 0) {
  console.log(`All ${rasterImages.length} images have an AVIF sibling.`);
  process.exit(0);
}

if (isCheckOnly) {
  console.error(
    `Missing AVIF siblings for ${missing.length} image(s). Run: bun run images:avif`,
  );
  for (const imagePath of missing) {
    console.error('  ' + imagePath);
  }
  process.exit(1);
}

for (const imagePath of missing) {
  execFileSync('avifenc', [
    '-q',
    AVIF_QUALITY,
    '-s',
    AVIF_SPEED,
    '--jobs',
    'all',
    imagePath,
    toAvifPath(imagePath),
  ]);
  console.log('encoded ' + toAvifPath(imagePath));
}

console.log(`Encoded ${missing.length} image(s).`);
