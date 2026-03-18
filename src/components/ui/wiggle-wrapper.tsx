'use client';

import { useState, type ReactNode } from 'react';

type WiggleWrapperProps = {
  enabled: boolean;
  children: ReactNode;
  className?: string;
};

export function WiggleWrapper({
  enabled,
  children,
  className,
}: WiggleWrapperProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFieldFocused, setIsFieldFocused] = useState(false);

  const shouldWiggle = enabled && !isHovered && !isFieldFocused;

  const INTERACTIVE_ELEMENT_SELECTORS = [
    'input',
    'textarea',
    'select',
    '[role="combobox"]',
    '[role="listbox"]',
  ] as const;
  const INTERACTIVE_ELEMENTS_QUERY = INTERACTIVE_ELEMENT_SELECTORS.join(', ');
  const RADIX_PORTAL_SELECTOR = '[data-radix-popper-content-wrapper]';

  function isInteractingWithField(container: HTMLElement): boolean {
    const activeElement = document.activeElement;
    if (!activeElement) return false;
    return (
      container
        .querySelector(INTERACTIVE_ELEMENTS_QUERY)
        ?.contains(activeElement) ?? false
    );
  }

  function isTargetInRadixPortal(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    return target.closest(RADIX_PORTAL_SELECTOR) !== null;
  }

  return (
    <div
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={(e) => {
        if (isTargetInRadixPortal(e.relatedTarget)) return;
        setIsHovered(false);
      }}
      onFocusCapture={(e) => {
        if (isInteractingWithField(e.currentTarget)) {
          setIsFieldFocused(true);
        }
      }}
      onBlurCapture={(e) => {
        if (isTargetInRadixPortal(e.relatedTarget)) return;
        setIsFieldFocused(false);
      }}
      style={{
        animation: shouldWiggle ? 'wiggle 0.5s infinite ease-in-out' : 'none',
      }}
    >
      {children}
    </div>
  );
}
