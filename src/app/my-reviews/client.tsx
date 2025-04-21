"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistance } from "date-fns";
import Header from "@/components/header";
import Footer from "@/components/footer";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { ChevronLeft, Edit2, Save, X } from "lucide-react";
import { trpc } from "@/lib/trpc/provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Game, GameReview } from "@prisma/client";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import ExpandableReviewNote from "../games/[id]/ExpandableReviewNote";

export default function MyReviewsClient({ 
  userReviews,
  isAuthenticated,
}: { 
  userReviews: (GameReview & { game: Game })[];
  isAuthenticated: boolean;
}) {
  const [editMode, setEditMode] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [editableReviews, setEditableReviews] = useState<Record<string, string>>({});
  const [focusedReview, setFocusedReview] = useState<string | null>(null);
  const router = useRouter();

  const deleteReviewMutation = trpc.review.deleteReview.useMutation({
    onSuccess: () => {
      router.refresh();
      toast("Review deleted");
    },
  });

  const updateReviewMutation = trpc.review.updateReview.useMutation({
    onSuccess: () => {
      router.refresh();
      toast("Review updated");
    },
  });

  // Set up initial editable reviews when edit mode is enabled
  const handleEditModeToggle = () => {
    if (!editMode) {
      // Entering edit mode - initialize editable reviews
      const initialEdits = userReviews.reduce((acc, review) => {
        acc[review.id] = review.notes || '';
        return acc;
      }, {} as Record<string, string>);
      setEditableReviews(initialEdits);
    }
    setEditMode(!editMode);
  };

  const handleUpdateReview = (reviewId: string) => {
    updateReviewMutation.mutate({
      reviewId,
      notes: editableReviews[reviewId],
    });
  };

  // Helper function to get performance color
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

  const handleDeleteConfirm = () => {
    if (reviewToDelete) {
      deleteReviewMutation.mutate({
        reviewId: reviewToDelete,
        confirmation: true,
      });
      setReviewToDelete(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-8">
        <div className="mb-4">
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 inline-flex items-center"
          >
            <ChevronLeft className="text-blue-400" />
            Home
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">My Game Reviews</h1>
          {userReviews.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditModeToggle}
              className="text-blue-400 hover:text-blue-300"
            >
              {editMode ? "Done" : <Edit2 size={18} />}
            </Button>
          )}
        </div>

        {userReviews.length === 0 ? (
          <Card className="bg-primary-gradient">
            <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
              <h2 className="text-xl font-medium text-white">
                You haven't submitted any game reviews yet
              </h2>
              <Link href="/">
                <Button>Browse Games</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userReviews.map((review) => (
              <div
                key={review.id}
                className={`relative ${editMode && focusedReview !== review.id ? "animate-wiggle" : ""}`}
                style={{
                  animation: editMode && focusedReview !== review.id
                    ? "wiggle 0.5s infinite ease-in-out"
                    : "none",
                }}
              >
                {editMode && (
                  <button
                    onClick={() => setReviewToDelete(review.id)}
                    className="absolute -top-2.5 -right-2.5 z-40 bg-destructive rounded-full p-1.5 shadow-md"
                    aria-label="Delete review"
                  >
                    <X size={16} className="text-white" />
                  </button>
                )}
                <Card className="bg-primary-gradient overflow-hidden pt-0">
                  <div className="aspect-[460/215] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
                    <img
                      src={`https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${review.gameId}/header.jpg`}
                      alt={review.game.id}
                      className="w-full h-full object-none"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                      <Link href={`/games/${review.gameId}`}>
                        {/* <h2 className="text-xl font-semibold text-white hover:text-blue-400 transition">
                          {review.game.id}
                        </h2> */}
                      </Link>
                      <div className="text-sm text-gray-300 mt-1">
                        Reviewed{" "}
                        {formatDistance(
                          new Date(review.createdAt),
                          new Date(),
                          { addSuffix: true }
                        )}
                      </div>
                    </div>
                  </div>

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
                                <Badge variant="secondary">
                                  {review.translationLayer}
                                </Badge>
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

                    {review.notes && (
                      <div className="border-t border-white/15 pt-3 mt-2">
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-2 flex justify-between items-center">
                            Review Note:
                            {editMode &&
                              editableReviews[review.id] !==
                                (review.notes || "") && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUpdateReview(review.id)}
                                  className="text-white hover:text-blue-300 p-1"
                                >
                                  <Save size={14} />
                                </Button>
                              )}
                          </h4>
                          {editMode ? (
                            <Textarea
                              value={editableReviews[review.id] || ""}
                              onChange={(e) =>
                                setEditableReviews({
                                  ...editableReviews,
                                  [review.id]: e.target.value,
                                })
                              }
                              onFocus={() => setFocusedReview(review.id)}
                              onBlur={() => setFocusedReview(null)}
                              className="bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 caret-blue-500 ring ring-blue-500"
                              placeholder="Add your thoughts about this game..."
                            />
                          ) : (
                            <ExpandableReviewNote notes={review.notes} />
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        <Dialog
          open={!!reviewToDelete}
          onOpenChange={(open) => !open && setReviewToDelete(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete review?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your
                game review.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReviewToDelete(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                {deleteReviewMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />

      <style jsx global>{`
        @keyframes wiggle {
          0% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-1deg);
          }
          75% {
            transform: rotate(1deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }

        textarea {
          caret-color: #3b82f6;
          caret-shape: block;
        }
      `}</style>
    </div>
  );
} 