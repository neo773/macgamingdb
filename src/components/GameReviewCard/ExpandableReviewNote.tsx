"use client";
import { ChevronUp, ChevronDown } from "lucide-react";
import React from "react";

// Client component for expandable review notes
const ExpandableReviewNote = ({ notes }: { notes: string }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  return (
    <div className="bg-[#181818] p-3 rounded-lg text-sm text-white border border-[rgba(255,255,255,0.1)]">
      <p className={isExpanded ? "" : "line-clamp-3"}>
        {notes.split("\n").map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < notes.split("\n").length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
      {notes.length > 100 && (
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
