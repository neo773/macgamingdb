import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/provider';

interface ScreenshotData {
  file: File;
  blobUrl: string;
  s3Url: string;
}

interface ScreenshotUploadProps {
  gameId: string;
  onScreenshotsChange: (screenshots: string[]) => void;
  maxFiles?: number;
  className?: string;
}

export default function ScreenshotUpload({
  gameId,
  onScreenshotsChange,
  maxFiles = 3,
  className = '',
}: ScreenshotUploadProps) {
  const [screenshots, setScreenshots] = useState<ScreenshotData[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getUploadUrlMutation = trpc.review.getUploadUrl.useMutation();

  useEffect(() => {
    return () => {
      screenshots.forEach((screenshot) => {
        URL.revokeObjectURL(screenshot.blobUrl);
      });
    };
  }, [screenshots]);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (screenshots.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} screenshots allowed`);
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`);
        }

        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name} is too large (max 10MB)`);
        }

        const blobUrl = URL.createObjectURL(file);

        const { signedUrl, publicUrl } = await getUploadUrlMutation.mutateAsync(
          {
            filename: file.name,
            contentType: file.type,
            gameId,
          }
        );

        const uploadResponse = await fetch(signedUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadResponse.ok) {
          URL.revokeObjectURL(blobUrl);
          throw new Error(`Failed to upload ${file.name}`);
        }

        return {
          file,
          blobUrl,
          s3Url: publicUrl,
        };
      });

      const uploadedScreenshots = await Promise.all(uploadPromises);
      const newScreenshots = [...screenshots, ...uploadedScreenshots];
      setScreenshots(newScreenshots);

      onScreenshotsChange(newScreenshots.map((s) => s.s3Url));
      toast.success(
        `${uploadedScreenshots.length} screenshot(s) uploaded successfully!`
      );
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeScreenshot = (index: number) => {
    const screenshotToRemove = screenshots[index];
    if (screenshotToRemove) {
      URL.revokeObjectURL(screenshotToRemove.blobUrl);
    }

    const newScreenshots = screenshots.filter((_, i) => i !== index);
    setScreenshots(newScreenshots);
    onScreenshotsChange(newScreenshots.map((s) => s.s3Url));
  };

  return (
    <div className={`flex flex-row gap-x-4 ${className}`}>
      <div className="flex flex-row items-center gap-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || screenshots.length >= maxFiles}
          className="flex items-center"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Add Screenshots
            </>
          )}
        </Button>
        <span className="text-sm text-gray-500">
          {screenshots.length}/{maxFiles}
        </span>
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {screenshots.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {screenshots.map((screenshot, index) => (
            <div key={index} className="relative group">
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                <img
                  src={screenshot.blobUrl}
                  alt={`Screenshot ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className =
                        'w-full h-full flex items-center justify-center text-gray-400';
                      fallback.innerHTML =
                        '<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" /></svg>';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeScreenshot(index)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
