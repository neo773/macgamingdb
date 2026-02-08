'use client';
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const R2_PUBLIC_URL = 'https://cdn.macgamingdb.app';

function toPublicUrl(url: string): string {
  try {
    const key = new URL(url).pathname.substring(1);
    return `${R2_PUBLIC_URL}/${key}`;
  } catch {
    return url;
  }
}

interface ScreenshotDisplayProps {
  screenshots: string[];
  className?: string;
}

export default function ScreenshotDisplay({
  screenshots,
}: ScreenshotDisplayProps) {
  const [open, setOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  const publicUrls = useMemo(
    () => screenshots.map(toPublicUrl),
    [screenshots]
  );

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setOpen(true);
  };

  if (screenshots.length === 0) return null;

  return (
    <div className="pt-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="!max-w-6xl w-full p-0 border-none bg-transparent overflow-hidden">
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={publicUrls[selectedImageIndex]}
              alt={`Screenshot ${selectedImageIndex + 1}`}
              className="w-auto h-auto max-w-full max-h-[80vh] object-contain rounded-lg border border-[#303030]"
            />
          </div>
        </DialogContent>
      </Dialog>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {publicUrls.slice(0, 3).map((url, index) => (
          <div
            key={index}
            className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-sm overflow-hidden border border-[#303030] hover:scale-105 transition-transform"
          >
            <img
              src={url}
              alt={`Screenshot ${index + 1}`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => handleImageClick(index)}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        ))}
      </div>
      {screenshots.length > 3 && (
        <p className="text-xs text-gray-400 mt-2">
          +{screenshots.length - 3} more screenshot
          {screenshots.length > 4 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
