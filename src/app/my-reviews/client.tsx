"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatDistance } from "date-fns";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { Card, CardContent } from "@/components/ui/card";
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
import GameReviewCard from "@/components/review/ReviewCard";
import ExpandableReviewNote from "../../components/review/ExpandableReviewNote";
import { Textarea } from "@/components/ui/textarea";
import { SteamAppData } from "@/server/helpers/steam";
import { Container } from "@/components/ui/container";

export default function MyReviewsClient({
  userReviews,
}: {
  userReviews: (GameReview & { game: Game })[];
}) {
  const [editMode, setEditMode] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [editableReviews, setEditableReviews] = useState<
    Record<string, string>
  >({});
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
      const initialEdits = userReviews.reduce(
        (acc, review) => {
          acc[review.id] = review.notes || "";
          return acc;
        },
        {} as Record<string, string>
      );
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
    <div className="min-h-screen flex flex-col">
      <Header />
      <Container>
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
            {userReviews.map((review) => {
              const gameDetails = JSON.parse(
                review.game.details ?? "{}"
              ) as SteamAppData;
              return (
                <div
                  key={review.id}
                  className={` ${editMode && focusedReview !== review.id ? "animate-wiggle" : ""}`}
                  style={{
                    animation:
                      editMode && focusedReview !== review.id
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
                  <GameReviewCard
                    review={review}
                    className="pt-0"
                    header={
                      <div className="aspect-[460/215] relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
                        <img
                          src={`${gameDetails.header_image}`}
                          alt={review.game.id}
                          className="w-full h-full object-none"
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                          <Link href={`/games/${review.gameId}`}></Link>
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
                    }
                    customReviewNote={
                      <>
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
                                      onClick={() =>
                                        handleUpdateReview(review.id)
                                      }
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
                      </>
                    }
                  />
                </div>
              );
            })}
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
      </Container>
      <Footer />
    </div>
  );
}
