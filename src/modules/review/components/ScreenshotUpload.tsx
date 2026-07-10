import React, { useId, useState } from 'react';
import { Button } from 'macgamingdb-ui/input/Button';
import { Input } from 'macgamingdb-ui/input/Input';
import { X, Upload, ImageOff } from 'lucide-react';
import { toast } from 'sonner';
import { isNonEmptyArray } from '@sniptt/guards';
import { trpc } from '@/modules/trpc/trpc';

const ALLOWED_SCREENSHOT_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
];

const MAX_SCREENSHOT_BYTES = 10 * 1024 * 1024;

interface ScreenshotUploadProps {
  gameId: string;
  onScreenshotsChange: (screenshots: string[]) => void;
  maxFiles?: number;
  className?: string;
}

export function ScreenshotUpload({
  gameId,
  onScreenshotsChange,
  maxFiles = 3,
  className = '',
}: ScreenshotUploadProps) {
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>([]);
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputId = useId();

  const getUploadUrlMutation = trpc.review.getUploadUrl.useMutation();

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const input = event.target;
    const files = input.files;
    if (!files || files.length === 0) return;

    if (screenshotUrls.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} screenshots allowed`);
      input.value = '';
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (!ALLOWED_SCREENSHOT_TYPES.includes(file.type)) {
          throw new Error(
            `${file.name} is not a supported format. Use PNG, JPG, WebP, or GIF.`,
          );
        }

        if (file.size > MAX_SCREENSHOT_BYTES) {
          throw new Error(`${file.name} is too large (max 10MB)`);
        }

        const { signedUrl, publicUrl } = await getUploadUrlMutation.mutateAsync(
          {
            filename: file.name,
            contentType: file.type,
            gameId,
          },
        );

        const uploadResponse = await fetch(signedUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const newScreenshotUrls = [...screenshotUrls, ...uploadedUrls];
      setScreenshotUrls(newScreenshotUrls);

      onScreenshotsChange(newScreenshotUrls);
      toast.success(
        `${uploadedUrls.length} screenshot(s) uploaded successfully!`,
      );
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
      input.value = '';
    }
  };

  const handleRemoveScreenshot = (url: string) => {
    const newScreenshotUrls = screenshotUrls.filter(
      (screenshotUrl) => screenshotUrl !== url,
    );
    setScreenshotUrls(newScreenshotUrls);
    onScreenshotsChange(newScreenshotUrls);
  };

  const handleImageError = (url: string) => {
    setFailedUrls((previous) =>
      previous.includes(url) ? previous : [...previous, url],
    );
  };

  return (
    <div className={`flex flex-row gap-x-4 ${className}`}>
      <div className="flex flex-row items-center gap-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading || screenshotUrls.length >= maxFiles}
          className="p-0"
          asChild
        >
          <label
            htmlFor={fileInputId}
            className="flex cursor-pointer items-center px-3"
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
          </label>
        </Button>
        <span className="text-sm text-gray-500">
          {screenshotUrls.length}/{maxFiles}
        </span>
      </div>

      <Input
        id={fileInputId}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/gif"
        multiple
        disabled={uploading || screenshotUrls.length >= maxFiles}
        onChange={handleFileSelect}
        className="hidden"
      />

      {isNonEmptyArray(screenshotUrls) && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {screenshotUrls.map((url, index) => (
            <div key={url} className="relative group">
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                {failedUrls.includes(url) ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageOff className="w-8 h-8" />
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={url}
                    alt={`Screenshot ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(url)}
                  />
                )}
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveScreenshot(url)}
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
