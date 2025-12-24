'use client';
import { ChevronUp, ChevronDown } from 'lucide-react';
import ScreenshotDisplay from './ScreenshotDisplay';
import React from 'react';
import { cn } from '@/components/utils';

const ExpandableReviewNote = ({
  notes,
  screenshots,
}: {
  notes: string;
  screenshots?: string[];
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const contentRef = React.useRef<HTMLParagraphElement>(null);
  const [isContentClipped, setIsContentClipped] = React.useState(false);

  React.useEffect(() => {
    const checkIfClipped = () => {
      if (contentRef.current) {
        const isClipped =
          contentRef.current.scrollHeight > contentRef.current.clientHeight;
        setIsContentClipped(isClipped);
      }
    };

    checkIfClipped();

    window.addEventListener('resize', checkIfClipped);
    return () => window.removeEventListener('resize', checkIfClipped);
  }, [notes]);

  return (
    <div className="bg-[#181818] p-3 rounded-lg text-sm text-white border border-[rgba(255,255,255,0.1)]">
      <p
        ref={contentRef}
        className={cn('break-words', isExpanded ? '' : 'line-clamp-3')}
      >
        {notes.split('\n').map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < notes.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>

      {screenshots && <ScreenshotDisplay screenshots={screenshots} />}

      {(isContentClipped || isExpanded) && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1"
        >
          {isExpanded ? (
            <>
              Read less <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              Read more <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>
      )}
    </div>
  );
};
export default ExpandableReviewNote;
