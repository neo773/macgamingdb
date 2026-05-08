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

const MAX_FILE_SIZE = 10 * 1024 * 1024;

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
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (screenshots.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} screenshots allowed`);
      return;
    }

    setUploading(true);

    const uploadSingleFile = async (file: File) => {
      const allowedTypes = [
        'image/png',
        'image/jpeg',
        'image/webp',
        'image/gif',
      ];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          `${file.name} is not a supported format. Use PNG, JPG, WebP, or GIF.`,
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`${file.name} is too large (max 10MB)`);
      }

      const blobUrl = URL.createObjectURL(file);

      const { signedUrl, publicUrl } = await getUploadUrlMutation.mutateAsync({
        filename: file.name,
        contentType: file.type,
        gameId,
      });

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
    };

    try {
      const uploadedScreenshots = await Promise.all(
        Array.from(files).map((file) => uploadSingleFile(file)),
      );
      const newScreenshots = [...screenshots, ...uploadedScreenshots];
      setScreenshots(newScreenshots);

      onScreenshotsChange(newScreenshots.map((s) => s.s3Url));
      toast.success(
        `${uploadedScreenshots.length} screenshot(s) uploaded successfully!`,
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
              <div className="size-4 border-2 border-zinc-300 border-t-blue-500 rounded-full animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="size-4" />
              Add Screenshots
            </>
          )}
        </Button>
        <span className="text-sm text-zinc-500">
          {screenshots.length}/{maxFiles}
        </span>
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/gif"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {screenshots.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {screenshots.map((screenshot, index) => (
            <div key={screenshot.s3Url} className="relative group">
              <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 rounded-md overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={screenshot.blobUrl}
                  alt={`Screenshot ${index + 1}`}
                  className="size-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className =
                        'size-full flex items-center justify-center text-zinc-400';
                      fallback.innerHTML =
                        '<svg class="size-8" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" /></svg>';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1 size-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeScreenshot(index)}
              >
                <X className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
