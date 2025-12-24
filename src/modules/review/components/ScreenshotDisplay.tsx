'use client';
import React, { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc/provider';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ScreenshotDisplayProps {
  screenshots: string[];
  className?: string;
}

export default function ScreenshotDisplay({
  screenshots,
}: ScreenshotDisplayProps) {
  const [signedUrls, setSignedUrls] = useState<
    { original: string; signed: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const { data, isLoading } = trpc.game.getScreenshotSignedUrls.useQuery(
    { screenshots },
    {
      enabled: screenshots.length > 0,
      staleTime: 30 * 60 * 1000, // 30 minutes
    }
  );

  useEffect(() => {
    if (data) {
      setSignedUrls(data);
      setLoading(false);
    }
  }, [data]);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setOpen(true);
  };

  if (screenshots.length === 0) return null;

  if (loading || isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-2">
        {screenshots.slice(0, 3).map((_, index) => (
          <div
            key={index}
            className="aspect-video bg-gray-700 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="pt-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="!max-w-6xl w-full p-0 border-none bg-transparent overflow-hidden">
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={signedUrls[selectedImageIndex]?.signed}
              alt={`Screenshot ${selectedImageIndex + 1}`}
              className="w-auto h-auto max-w-full max-h-[80vh] object-contain rounded-lg border border-[#303030]"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const urlData = signedUrls[selectedImageIndex];
                if (
                  urlData &&
                  target.src === urlData.signed &&
                  urlData.original !== urlData.signed
                ) {
                  target.src = urlData.original;
                }
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {signedUrls.slice(0, 3).map((urlData, index) => (
          <div
            key={index}
            className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-sm overflow-hidden border border-[#303030] hover:scale-105 transition-transform"
          >
            <img
              src={urlData.signed}
              alt={`Screenshot ${index + 1}`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => handleImageClick(index)}
              onError={(e) => {
                const target = e.target as HTMLImageElement;

                if (
                  target.src === urlData.signed &&
                  urlData.original !== urlData.signed
                ) {
                  target.src = urlData.original;
                } else {
                  target.style.display = 'none';
                }
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
