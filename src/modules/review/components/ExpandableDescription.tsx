'use client';

import { useState } from 'react';
import { Button } from 'macgamingdb-ui/input/Button';

interface ExpandableDescriptionProps {
  description: string;
}

export function ExpandableDescription({
  description,
}: ExpandableDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTooLong, setIsTooLong] = useState(false);

  const measureRef = (node: HTMLDivElement | null) => {
    if (!node) return;

    const checkTooLong = () => {
      setIsTooLong(node.scrollHeight > 150);
    };

    checkTooLong();

    const observer = new ResizeObserver(checkTooLong);
    observer.observe(node);

    return () => observer.disconnect();
  };

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
          ref={measureRef}
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
