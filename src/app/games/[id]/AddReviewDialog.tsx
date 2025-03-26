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

// Define types for the form data
type PlayMethod = 'NATIVE' | 'CROSSOVER' | 'PARALLELS' | 'OTHER';
type TranslationLayer = 'DXVK' | 'DXMT' | 'D3D_METAL' | 'NONE';
type Performance = 'EXCELLENT' | 'GOOD' | 'PLAYABLE' | 'BARELY_PLAYABLE' | 'UNPLAYABLE';
type GraphicsSettings = 'ULTRA' | 'HIGH' | 'MEDIUM' | 'LOW';
type Chipset = 'M1' | 'M2' | 'M3';
type ChipsetVariant = 'BASE' | 'PRO' | 'MAX' | 'ULTRA';

export default function AddReviewDialog({ gameId, gameName }: AddReviewDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form state with proper typing
  const [formData, setFormData] = useState({
    playMethod: 'CROSSOVER' as PlayMethod,
    translationLayer: 'DXVK' as TranslationLayer,
    performance: 'GOOD' as Performance,
    fps: '',
    graphicsSettings: 'HIGH' as GraphicsSettings,
    resolution: '',
    chipset: 'M1' as Chipset,
    chipsetVariant: 'BASE' as ChipsetVariant,
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
                <div 
                  className={`cursor-pointer flex flex-col items-center ${
                    formData.playMethod === 'NATIVE' 
                      ? 'text-blue-600 font-medium' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                  onClick={() => handlePlayMethodSelect('NATIVE')}
                >
                  <div className={`relative p-1 rounded-lg ${
                    formData.playMethod === 'NATIVE' 
                      ? 'ring-2 ring-blue-500' 
                      : ''
                  }`}>
                    <img 
                      src="/images/native.png" 
                      alt="Native" 
                      className="w-14 h-14 object-contain" 
                    />
                  </div>
                  <span className="mt-1 text-sm">Native</span>
                </div>
                
                <div 
                  className={`cursor-pointer flex flex-col items-center ${
                    formData.playMethod === 'CROSSOVER' 
                      ? 'text-blue-600 font-medium' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                  onClick={() => handlePlayMethodSelect('CROSSOVER')}
                >
                  <div className={`relative p-1 rounded-lg ${
                    formData.playMethod === 'CROSSOVER' 
                      ? 'ring-2 ring-blue-500' 
                      : ''
                  }`}>
                    <img 
                      src="/images/crossover.png" 
                      alt="CrossOver" 
                      className="w-14 h-14 object-contain" 
                    />
                  </div>
                  <span className="mt-1 text-sm">CrossOver</span>
                </div>
                
                <div 
                  className={`cursor-pointer flex flex-col items-center ${
                    formData.playMethod === 'PARALLELS' 
                      ? 'text-blue-600 font-medium' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                  onClick={() => handlePlayMethodSelect('PARALLELS')}
                >
                  <div className={`relative p-1 rounded-lg ${
                    formData.playMethod === 'PARALLELS' 
                      ? 'ring-2 ring-blue-500' 
                      : ''
                  }`}>
                    <img 
                      src="/images/parallels.png" 
                      alt="Parallels" 
                      className="w-14 h-14 object-contain" 
                    />
                  </div>
                  <span className="mt-1 text-sm">Parallels</span>
                </div>
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
              <label className="block text-sm font-medium">Mac Chipset</label>
              <select
                name="combinedChipset"
                value={`${formData.chipset}-${formData.chipsetVariant}`}
                onChange={handleChipsetSelect}
                className="w-full rounded-md border border-gray-300 p-2 dark:bg-gray-700 dark:border-gray-600"
                required
              >
                <option value="M1-BASE">M1</option>
                <option value="M1-PRO">M1 Pro</option>
                <option value="M1-MAX">M1 Max</option>
                <option value="M1-ULTRA">M1 Ultra</option>
                <option value="M2-BASE">M2</option>
                <option value="M2-PRO">M2 Pro</option>
                <option value="M2-MAX">M2 Max</option>
                <option value="M2-ULTRA">M2 Ultra</option>
                <option value="M3-BASE">M3</option>
                <option value="M3-PRO">M3 Pro</option>
                <option value="M3-MAX">M3 Max</option>
                <option value="M3-ULTRA">M3 Ultra</option>
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