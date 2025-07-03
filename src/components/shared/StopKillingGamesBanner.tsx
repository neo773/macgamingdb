"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { SVGProps } from "react";

const EUFlag = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 810 540"
    {...props}
  >
    <defs>
      <g id="d">
        <g id="b">
          <path id="a" d="M0 0v1h.5z" transform="rotate(18 3.157 -.5)" />
          <use xlinkHref="#a" transform="scale(-1 1)" />
        </g>
        <g id="c">
          <use xlinkHref="#b" transform="rotate(72)" />
          <use xlinkHref="#b" transform="rotate(144)" />
        </g>
        <use xlinkHref="#c" transform="scale(-1 1)" />
      </g>
    </defs>
    <path fill="#039" d="M0 0h810v540H0z" />
    <g fill="#fc0" transform="matrix(30 0 0 30 405 270)">
      <use xlinkHref="#d" y={-6} />
      <use xlinkHref="#d" y={6} />
      <g id="e">
        <use xlinkHref="#d" x={-6} />
        <use xlinkHref="#d" transform="rotate(-144 -2.344 -2.11)" />
        <use xlinkHref="#d" transform="rotate(144 -2.11 -2.344)" />
        <use xlinkHref="#d" transform="rotate(72 -4.663 -2.076)" />
        <use xlinkHref="#d" transform="rotate(72 -5.076 .534)" />
      </g>
      <use xlinkHref="#e" transform="scale(-1 1)" />
    </g>
  </svg>
);

export default function StopKillingGamesBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem("stopKillingGamesBannerDismissed");
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("stopKillingGamesBannerDismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="bg-blue-600 text-white py-3 px-4 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 flex items-center justify-center gap-3">
          <EUFlag width={32} className="flex-shrink-0 rounded-xs" />
          <span className="font-medium">
            <a
              href="https://www.stopkillinggames.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              Take a look at the Stop Killing Games initiative if you are an EU
              citizen.
            </a>
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="text-white hover:bg-blue-700 h-6 w-6 rounded-full ml-4 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
