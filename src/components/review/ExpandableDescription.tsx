'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ExpandableDescriptionProps {
  description: string;
}

export default function ExpandableDescription({
  description,
}: ExpandableDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTooLong, setIsTooLong] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const fullContent = contentRef.current;
      setIsTooLong(fullContent.scrollHeight > 150);
    }
  }, [description]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="mt-2">
      <div
        className={`overflow-hidden relative ${isExpanded ? '' : 'max-h-[200px]'}`}
        style={{ transition: 'max-height 0.3s ease-in-out' }}
      >
        <div
          ref={contentRef}
          dangerouslySetInnerHTML={{ __html: description }}
          className="game-description"
        />
      </div>

      {isTooLong && (
        <Button
          onClick={toggleExpand}
          variant="link"
          className="mt-2 text-blue-400 hover:text-blue-300 p-0 h-auto"
        >
          {isExpanded ? 'Show Less' : 'Read More'}
        </Button>
      )}
    </div>
  );
}
