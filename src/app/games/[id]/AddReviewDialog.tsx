'use client';

import { useState, useEffect } from 'react';
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
import type { 
  PlayMethod, 
  TranslationLayer, 
  Performance, 
  GraphicsSettings, 
  Chipset, 
  ChipsetVariant 
} from '@/server/routers/review';

type AddReviewDialogProps = {
  gameId: string;
  gameName: string;
};

// Interface for chipset combinations
interface ChipsetCombination {
  value: string;
  label: string;
}

export default function AddReviewDialog({ gameId, gameName }: AddReviewDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Fetching enum values from server
  const { data: enumValues, isLoading: isLoadingEnums } = trpc.review.getEnumValues.useQuery();
  const { data: chipsetCombinations, isLoading: isLoadingChipsets } = trpc.review.getChipsetCombinations.useQuery();
  
  // Form state with proper typing
  const [formData, setFormData] = useState({
    playMethod: '' as PlayMethod,
    translationLayer: '' as TranslationLayer,
    performance: '' as Performance,
    fps: '',
    graphicsSettings: '' as GraphicsSettings,
    resolution: '',
    chipset: '' as Chipset,
    chipsetVariant: '' as ChipsetVariant,
    notes: '',
    userId: 'user-' + Math.floor(Math.random() * 1000000), // Generate a random user ID for now
  });
  
  // Initialize form with default values once enum values are loaded
  useEffect(() => {
    if (enumValues) {
      setFormData(prev => ({
        ...prev,
        playMethod: enumValues.playMethods[1], // Default to CROSSOVER
        translationLayer: enumValues.translationLayers[0], // Default to DXVK
        performance: enumValues.performanceRatings[1], // Default to GOOD
        graphicsSettings: enumValues.graphicsSettings[1], // Default to HIGH
        chipset: enumValues.chipsets[0], // Default to M1
        chipsetVariant: enumValues.chipsetVariants[0], // Default to BASE
      }));
    }
  }, [enumValues]);
  
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
  const isLoading = isLoadingEnums || isLoadingChipsets;
  
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

  // Handle play method selection with fixed typing
  const handlePlayMethodSelect = (method: PlayMethod) => {
    setFormData(prev => ({ ...prev, playMethod: method }));
  };

  // Handle combined chipset selection with fixed typing
  const handleChipsetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [chipset, chipsetVariant] = e.target.value.split('-');
    setFormData(prev => ({ 
      ...prev, 
      chipset: chipset as Chipset, 
      chipsetVariant: chipsetVariant as ChipsetVariant 
    }));
  };

  // If loading, show a loading state
  if (isLoading) {
    return <Button disabled>Loading...</Button>;
  }

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
              <div className="flex gap-4 justify-between">
                {enumValues?.playMethods.map(method => (
                  <div 
                    key={method}
                    className={`cursor-pointer flex flex-col items-center ${
                      formData.playMethod === method 
                        ? 'text-blue-600 font-medium' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                    onClick={() => handlePlayMethodSelect(method)}
                  >
                    <div className={`relative p-1 rounded-lg ${
                      formData.playMethod === method 
                        ? 'ring-2 ring-blue-500' 
                        : ''
                    }`}>
                      <img 
                        src={`/images/${method.toLowerCase()}.png`} 
                        alt={method} 
                        className="w-14 h-14 object-contain" 
                      />
                    </div>
                    <span className="mt-1 text-sm">
                      {method === 'NATIVE' ? 'Native' : 
                       method === 'CROSSOVER' ? 'CrossOver' : 
                       method === 'PARALLELS' ? 'Parallels' : 'Other'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
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
                  {enumValues?.translationLayers.map(layer => (
                    <option key={layer} value={layer}>
                      {layer === 'DXVK' ? 'DXVK' : 
                       layer === 'DXMT' ? 'DXMT' : 
                       layer === 'D3D_METAL' ? 'D3D Metal' : 'None / Default'}
                    </option>
                  ))}
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
                {enumValues?.performanceRatings.map(rating => (
                  <option key={rating} value={rating}>
                    {rating === 'EXCELLENT' ? 'Excellent' : 
                     rating === 'GOOD' ? 'Good' : 
                     rating === 'PLAYABLE' ? 'Playable' : 
                     rating === 'BARELY_PLAYABLE' ? 'Barely Playable' : 'Unplayable'}
                  </option>
                ))}
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
                {enumValues?.graphicsSettings.map(setting => (
                  <option key={setting} value={setting}>
                    {setting === 'ULTRA' ? 'Ultra' : 
                     setting === 'HIGH' ? 'High' : 
                     setting === 'MEDIUM' ? 'Medium' : 'Low'}
                  </option>
                ))}
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
              <label className="block text-sm font-medium">Mac Chipset</label>
              <select
                name="combinedChipset"
                value={`${formData.chipset}-${formData.chipsetVariant}`}
                onChange={handleChipsetSelect}
                className="w-full rounded-md border border-gray-300 p-2 dark:bg-gray-700 dark:border-gray-600"
                required
              >
                {chipsetCombinations?.map((combo: ChipsetCombination) => (
                  <option key={combo.value} value={combo.value}>
                    {combo.label}
                  </option>
                ))}
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