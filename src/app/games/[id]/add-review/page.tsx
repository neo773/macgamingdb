'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SteamGame } from '@/lib/algolia';

export default async function AddReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const router = useRouter();
  const [gameDetails, setGameDetails] = useState<SteamGame | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    playMethod: 'CROSSOVER',
    translationLayer: 'DXVK',
    performance: 'GOOD',
    fps: '',
    graphicsSettings: 'HIGH',
    resolution: '',
    chipset: 'M1',
    chipsetVariant: 'BASE',
    notes: '',
    userId: 'user-' + Math.floor(Math.random() * 1000000), // Generate a random user ID for now
  });
  
  // Fetch game details
  useEffect(() => {
    async function fetchGameDetails() {
      try {
        const res = await fetch(`/api/games/${id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch game details');
        }
        const data = await res.json();
        setGameDetails(data.game);
      } catch (error) {
        setError('Error loading game details. Please try again.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchGameDetails();
  }, [id]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Only include translationLayer if method is CROSSOVER
      const reviewData = {
        ...formData,
        gameId: id,
        fps: formData.fps ? parseInt(formData.fps) : null,
        translationLayer: formData.playMethod === 'CROSSOVER' ? formData.translationLayer : null
      };
      
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }
      
      setSuccess(true);
      
      // Redirect after successful submission
      setTimeout(() => {
        router.push(`/games/${id}`);
      }, 2000);
      
    } catch (error) {
      setError('Error submitting review. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  if (!gameDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Game not found. Please try again or return to the home page.</p>
          <Link href="/" className="text-blue-500 hover:underline mt-2 inline-block">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link 
          href={`/games/${id}`} 
          className="text-blue-500 hover:text-blue-700 inline-flex items-center"
        >
          ← Back to game details
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold mb-4">Add Experience for {gameDetails.name}</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Your review has been submitted successfully! Redirecting...
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Play Method</label>
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
              <div>
                <label className="block text-sm font-medium mb-1">Translation Layer</label>
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
            
            <div>
              <label className="block text-sm font-medium mb-1">Performance Rating</label>
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
            
            <div>
              <label className="block text-sm font-medium mb-1">FPS (optional)</label>
              <input
                type="number"
                name="fps"
                value={formData.fps}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 p-2 dark:bg-gray-700 dark:border-gray-600"
                placeholder="e.g. 60"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Graphics Settings</label>
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
            
            <div>
              <label className="block text-sm font-medium mb-1">Resolution (optional)</label>
              <input
                type="text"
                name="resolution"
                value={formData.resolution}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 p-2 dark:bg-gray-700 dark:border-gray-600"
                placeholder="e.g. 1920x1080"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Chipset</label>
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
            
            <div>
              <label className="block text-sm font-medium mb-1">Chipset Variant</label>
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
          
          <div>
            <label className="block text-sm font-medium mb-1">Notes (optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 p-2 h-24 dark:bg-gray-700 dark:border-gray-600"
              placeholder="Share your experience, tips, or any issues you encountered..."
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || success}
              className={`px-4 py-2 rounded bg-blue-500 text-white ${
                (isSubmitting || success) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 