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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from "sonner"
import { PlusIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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
  const [email, setEmail] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  
  // Fetching enum values from server
  const { data: enumValues, isLoading: isLoadingEnums } = trpc.review.getEnumValues.useQuery();
  const { data: chipsetCombinations, isLoading: isLoadingChipsets } = trpc.review.getChipsetCombinations.useQuery();
  
  const { user, isLoading: isAuthLoading, signIn } = useAuth();

  
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
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    // Prevent default form submission if event is provided
    if (e) e.preventDefault();
    
    // Validate required fields
    if (!formData.playMethod || !formData.performance || !formData.chipset || !formData.chipsetVariant) {
      setError('Please fill in all required fields.');
      return;
    }

    setError(null);

    try {
      // Create the review
      await createReviewMutation.mutateAsync({
        gameId: gameId as string,
        playMethod: formData.playMethod,
        translationLayer: formData.playMethod === 'CROSSOVER' ? formData.translationLayer : null,
        performance: formData.performance,
        fps: formData.fps ? parseInt(formData.fps) : null,
        graphicsSettings: formData.graphicsSettings,
        resolution: formData.resolution,
        chipset: formData.chipset,
        chipsetVariant: formData.chipsetVariant,
        notes: formData.notes,
      });
      
      toast("Your review has been submitted successfully!");
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

  // Handle magic link login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoggingIn(true);
    setError(null);
    
    try {
      await signIn(email, window.location.href);
      setMagicLinkSent(true);
      toast("Magic link sent to your email!");
    } catch (error) {
      setError('Error sending magic link. Please try again.');
      console.error(error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // If loading, show a loading state
  if (isLoading) {
    return <Button disabled>Loading...</Button>;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={"lg"}>
          <PlusIcon/>
          Add Experience Report</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-3xl bg-black border border-[#272727]">
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
        
        {!user && !isAuthLoading ? (
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-3xl p-6 z-10">
            <div className="max-w-md w-full bg-black border border-[#272727] p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4">Login Required</h3>
              <p className="mb-6">Please log in to share your experience with this game.</p>
              
              {magicLinkSent ? (
                <div className="text-center py-4">
                  <p className="mb-2">✉️ Magic link sent!</p>
                  <p className="text-sm text-gray-400">Check your email for a login link.</p>
                </div>
              ) : (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email Address</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoggingIn}
                    size="lg"
                  >
                    {isLoggingIn ? 'Sending Magic Link...' : 'Login with Magic Link'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        ) : null}
        
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
                        ? 'text-blue-500 font-medium' 
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
                <Select
                  value={formData.translationLayer}
                  onValueChange={(value) => handleSelectChange("translationLayer", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select translation layer" />
                  </SelectTrigger>
                  <SelectContent>
                    {enumValues?.translationLayers.map(layer => (
                      <SelectItem key={layer} value={layer}>
                        {layer === 'DXVK' ? 'DXVK' : 
                         layer === 'DXMT' ? 'DXMT' : 
                         layer === 'D3D_METAL' ? 'D3D Metal' : 'None / Default'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Performance Rating</label>
              <Select
                value={formData.performance}
                onValueChange={(value) => handleSelectChange("performance", value)}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select performance rating" />
                </SelectTrigger>
                <SelectContent>
                  {enumValues?.performanceRatings.map(rating => (
                    <SelectItem key={rating} value={rating}>
                      {rating === 'EXCELLENT' ? 'Excellent' : 
                       rating === 'GOOD' ? 'Good' : 
                       rating === 'PLAYABLE' ? 'Playable' : 
                       rating === 'BARELY_PLAYABLE' ? 'Barely Playable' : 'Unplayable'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Select
                value={formData.graphicsSettings}
                onValueChange={(value) => handleSelectChange("graphicsSettings", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select graphics settings" />
                </SelectTrigger>
                <SelectContent>
                  {enumValues?.graphicsSettings.map(setting => (
                    <SelectItem key={setting} value={setting}>
                      {setting === 'ULTRA' ? 'Ultra' : 
                       setting === 'HIGH' ? 'High' : 
                       setting === 'MEDIUM' ? 'Medium' : 'Low'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Select
                value={`${formData.chipset}-${formData.chipsetVariant}`}
                onValueChange={(value) => {
                  const [chipset, chipsetVariant] = value.split('-');
                  setFormData(prev => ({ 
                    ...prev, 
                    chipset: chipset as Chipset, 
                    chipsetVariant: chipsetVariant as ChipsetVariant 
                  }));
                }}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Mac chipset" />
                </SelectTrigger>
                <SelectContent>
                  {chipsetCombinations?.map((combo: ChipsetCombination) => (
                    <SelectItem key={combo.value} value={combo.value}>
                      {combo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Notes (optional)</label>
            <Textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Share your experience, tips, or any issues you encountered..."
            />
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary" type="button" size={"lg"} disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type="submit"
              disabled={isSubmitting || success}
              size={"lg"}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 