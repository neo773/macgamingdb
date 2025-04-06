"use client";

import { useState, useEffect } from "react";

interface ExpandableDescriptionProps {
  description: string;
}

export default function ExpandableDescription({ description }: ExpandableDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [plainText, setPlainText] = useState("");
  const [isTooLong, setIsTooLong] = useState(false);
  
  useEffect(() => {
    // Create a temporary div to parse HTML content safely
    const div = document.createElement('div');
    div.innerHTML = description;
    const text = div.textContent || div.innerText || '';
    setPlainText(text);
    setIsTooLong(text.length > 300);
  }, [description]);
  
  return (
    <div className="mt-2">
      {isExpanded ? (
        <div dangerouslySetInnerHTML={{ __html: description }} />
      ) : (
        <div>
          <p>{plainText.substring(0, 300)}{isTooLong ? '...' : ''}</p>
        </div>
      )}
      
      {isTooLong && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="mt-4 text-blue-400 hover:text-blue-300 font-medium"
        >
          {isExpanded ? "Show Less" : "Read More"}
        </button>
      )}
    </div>
  );
} 