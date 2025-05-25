import ExpandableReviewNote from "@/components/review/ExpandableReviewNote";
import { GameReview } from "@prisma/client";
import React from "react";
import { Card, CardHeader, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import clsx from "clsx";

const getPerformanceColor = (performance: string) => {
  const colors: Record<string, string> = {
    EXCELLENT: "bg-green-500 text-green-50",
    GOOD: "bg-blue-500 text-blue-50",
    PLAYABLE: "bg-yellow-500 text-yellow-900",
    BARELY_PLAYABLE: "bg-orange-500 text-orange-50",
    UNPLAYABLE: "bg-red-500 text-red-50",
  };
  return colors[performance] || "bg-gray-500 text-gray-50";
};
// const getPerformanceColor = (performance: Performance) => {
//   const colors: Record<Performance, string> = {
//     EXCELLENT: "bg-gradient-to-tr from-[#051a0d] to-[#095025] text-[#0f0] border border-[#00ff001a]",
//     GOOD: "bg-gradient-to-tr from-[#01070a] to-[#00448b] text-[#0096ff] border border-[#00eaff1a]",
//     PLAYABLE: "bg-gradient-to-tr from-[#553a08] to-[#bd9f00] text-[#ffee00] border border-[#FFD7001a]",
//     BARELY_PLAYABLE: "bg-gradient-to-tr from-[#4a2510] to-[#a35c00] text-[#ffa500] border border-[#ff85001a]",
//     UNPLAYABLE: "bg-gradient-to-tr from-[#520b0b] to-[#761717] text-[#ff3535] border border-[#FF00001a]",
//   };
//   return colors[performance] || "bg-gray-500 text-gray-50";
// };

// Helper function to format method name
const formatMethodName = (method: string) => {
  const formats: Record<string, string> = {
    NATIVE: "Native",
    CROSSOVER: "CrossOver",
    PARALLELS: "Parallels",
    OTHER: "Other",
  };
  return formats[method] || method;
};

const GameReviewCard = ({
  review,
  header,
  customReviewNote,
  className,
}: {
  review: GameReview;
  header?: React.ReactNode;
  customReviewNote?: React.ReactNode;
  className?: string;
}) => {
  return (
    <Card
      key={review.id}
      className={clsx("bg-primary-gradient overflow-hidden", className)}
    >
      {header && header}
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-4">
              <img
                src={`/images/${review.playMethod.toLowerCase()}.png`}
                alt={formatMethodName(review.playMethod)}
                className="size-16 object-contain"
              />
              <div className="flex flex-col justify-between -mt-1">
                <p className="font-medium text-white text-lg">
                  {formatMethodName(review.playMethod)}
                </p>

                {review.softwareVersion && (
                  <span className="text-gray-400 text-xs ml-1 -mt-[5px]">
                    v{review.softwareVersion}
                  </span>
                )}

                <div className="flex gap-2">
                  {review.translationLayer && (
                    <Badge variant="secondary">{review.translationLayer}</Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={`${getPerformanceColor(review.performance)}`}
                  >
                    {review.performance.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <img
            src={`/images/chipsets/${review.chipset.toLowerCase()}/${review.chipsetVariant.toLowerCase()}.png`}
            alt={`${review.chipset} ${review.chipsetVariant}`}
            className="w-[70px] object-contain"
          />
        </div>
      </CardHeader>

      <CardContent>
        <div className="border-t border-white/15 pt-3 pb-2">
          <dl className="space-y-2 text-sm text-gray-300">
            <div className="flex justify-between">
              <dt className="font-medium">Graphics:</dt>
              <dd className="font-semibold text-white font-mono">
                {review.graphicsSettings}
              </dd>
            </div>

            {review.fps && (
              <div className="flex justify-between">
                <dt className="font-medium">FPS:</dt>
                <dd className="font-semibold text-white font-mono">
                  {review.fps}
                </dd>
              </div>
            )}

            {review.resolution && (
              <div className="flex justify-between">
                <dt className="font-medium">Resolution:</dt>
                <dd className="font-semibold text-white font-mono">
                  {review.resolution}
                </dd>
              </div>
            )}

            <div className="flex justify-between">
              <dt className="font-medium">Hardware:</dt>
              <dd className="font-semibold text-white font-mono">
                {review.chipset} {review.chipsetVariant}
              </dd>
            </div>
          </dl>
        </div>

        {customReviewNote ? (
          customReviewNote
        ) : (
          <>
            {review.notes && (
              <div className="border-t border-white/15 pt-3 mt-2">
                <h4 className="text-sm font-medium text-gray-300 mb-2">
                  Review Note:
                </h4>
                <ExpandableReviewNote notes={review.notes} />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GameReviewCard;
