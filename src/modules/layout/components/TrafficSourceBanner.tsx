'use client';

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc/provider';
import { toast } from 'sonner';
import { X, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function TrafficSourceWidget() {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSource, setSelectedSource] = useState('');
  const [customSource, setCustomSource] = useState('');

  const submitSource = trpc.traffic.submitSource.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setIsVisible(false);
      localStorage.setItem('traffic_source_submitted', 'true');
    },
    onError: (error) => {
      toast.error('Failed to submit feedback. Please try again.');
      console.error('Error submitting traffic source:', error);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  useEffect(() => {
    const hasSubmitted = localStorage.getItem('traffic_source_submitted');
    const hasDismissed = localStorage.getItem('traffic_source_dismissed');

    if (!hasSubmitted && !hasDismissed) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = () => {
    const source = selectedSource === 'Other' ? customSource : selectedSource;

    if (!source.trim()) {
      toast.error('Please select or enter how you heard about us.');
      return;
    }

    setIsSubmitting(true);
    submitSource.mutate({
      source: source.trim(),
      userAgent: navigator.userAgent,
    });
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('traffic_source_dismissed', 'true');
  };

  if (!isVisible) return null;

  const sources = [
    'Reddit',
    'Twitter',
    'Hacker News',
    'YouTube',
    'Friend/Word of mouth',
    'Search engine',
    'Other',
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <Card className="w-80 shadow-2xl border-border bg-card/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <CardTitle className="text-base">Quick question!</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-6 w-6 rounded-full"
              disabled={isSubmitting}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            We're seeing huge traffic! Where did you hear about us?
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {sources.map((source) => (
              <Badge
                key={source}
                variant={selectedSource === source ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-accent transition-colors text-xs px-2 py-1"
                onClick={() => setSelectedSource(source)}
              >
                {source}
              </Badge>
            ))}
          </div>

          {selectedSource === 'Other' && (
            <Input
              placeholder="Please specify..."
              value={customSource}
              onChange={(e) => setCustomSource(e.target.value)}
              disabled={isSubmitting}
              className="text-sm"
            />
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                !selectedSource ||
                (selectedSource === 'Other' && !customSource.trim())
              }
              size="sm"
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              size="sm"
              disabled={isSubmitting}
            >
              Skip
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
