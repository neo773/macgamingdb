'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/provider';
import { useRouter } from 'next/navigation';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type AddReviewDialogProps = {
  gameId: string;
  gameName: string;
};

export default function AddReviewDialog({ gameId, gameName }: AddReviewDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    playMethod: 'CROSSOVER' as const,
    translationLayer: 'DXVK' as const,
    performance: 'GOOD' as const,
    fps: '',
    graphicsSettings: 'HIGH' as const,
    resolution: '',
    chipset: 'M1' as const,
    chipsetVariant: 'BASE' as const,
    notes: '',
    userId: 'user-' + Math.floor(Math.random() * 1000000), // Generate a random user ID for now
  });
  
  // Create review mutation
  const createReviewMutation = trpc.review.create.useMutation({
    onSuccess: () => {
      setSuccess(true);
      // Refresh the page after successful submission
      setTimeout(() => {
        setOpen(false);
        router.refresh();
      }, 2000);
    },
    onError: (error) => {
      setError('Error submitting review. Please try again.');
      console.error(error);
    }
  });
  
  const isSubmitting = createReviewMutation.isPending;
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      // Only include translationLayer if method is CROSSOVER
      const reviewData = {
        ...formData,
        gameId,
        fps: formData.fps ? parseInt(formData.fps) : null,
        translationLayer: formData.playMethod === 'CROSSOVER' ? formData.translationLayer : null
      };
      
      createReviewMutation.mutate(reviewData);
      
    } catch (error) {
      setError('Error submitting review. Please try again.');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Experience Report</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Experience for {gameName}</DialogTitle>
          <DialogDescription>
            Share your experience running this game on your Mac.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Your review has been submitted successfully!
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Play Method</label>
              <select
                name="playMethod"
                value={formData.playMethod}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 p-2 dark:bg-gray-700 dark:border-gray-600"
                required
              >
                <option value="NATIVE">Native</option>
                <option value="CROSSOVER">CrossOver</option>
                <option value="PARALLELS">Parallels</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            
            {formData.playMethod === 'CROSSOVER' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium">Translation Layer</label>
                <select
                  name="translationLayer"
                  value={formData.translationLayer}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 p-2 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="DXVK">DXVK</option>
                  <option value="DXMT">DXMT</option>
                  <option value="D3D_METAL">D3D Metal</option>
                  <option value="NONE">None / Default</option>
                </select>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Performance Rating</label>
              <select
                name="performance"
                value={formData.performance}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 p-2 dark:bg-gray-700 dark:border-gray-600"
                required
              >
                <option value="EXCELLENT">Excellent</option>
                <option value="GOOD">Good</option>
                <option value="PLAYABLE">Playable</option>
                <option value="BARELY_PLAYABLE">Barely Playable</option>
                <option value="UNPLAYABLE">Unplayable</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">FPS (optional)</label>
              <Input
                type="number"
                name="fps"
                value={formData.fps}
                onChange={handleInputChange}
                placeholder="e.g. 60"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Graphics Settings</label>
              <select
                name="graphicsSettings"
                value={formData.graphicsSettings}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 p-2 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="ULTRA">Ultra</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Resolution (optional)</label>
              <Input
                type="text"
                name="resolution"
                value={formData.resolution}
                onChange={handleInputChange}
                placeholder="e.g. 1920x1080"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Chipset</label>
              <select
                name="chipset"
                value={formData.chipset}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 p-2 dark:bg-gray-700 dark:border-gray-600"
                required
              >
                <option value="M1">M1</option>
                <option value="M2">M2</option>
                <option value="M3">M3</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Chipset Variant</label>
              <select
                name="chipsetVariant"
                value={formData.chipsetVariant}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 p-2 dark:bg-gray-700 dark:border-gray-600"
                required
              >
                <option value="BASE">Base</option>
                <option value="PRO">Pro</option>
                <option value="MAX">Max</option>
                <option value="ULTRA">Ultra</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Notes (optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 p-2 h-24 dark:bg-gray-700 dark:border-gray-600"
              placeholder="Share your experience, tips, or any issues you encountered..."
            />
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type="submit"
              disabled={isSubmitting || success}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 