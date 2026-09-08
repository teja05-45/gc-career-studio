"use client";

import * as React from "react";
import { MessageSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { ReviewDialog } from "@/components/candidate/review-dialog";

/**
 * Post-session feedback card. Shown on past COMPLETED appointments:
 *  - no review yet  → "How was your session?" + [Leave a review]
 *  - review exists  → read-only confirmation of the rating (+ your words)
 */
export function SessionFeedback({
  bookingId,
  review,
}: {
  bookingId: string;
  review: { rating: number; comment: string | null } | null;
}) {
  const [open, setOpen] = React.useState(false);

  if (review) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
            <Star className="h-5 w-5 fill-success/60 text-success" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Thanks for sharing your experience.</p>
            <div className="mt-0.5 flex items-center gap-2">
              <StarRating value={review.rating} size="sm" />
              <span className="text-xs text-muted-foreground">Your rating: {review.rating}/5</span>
            </div>
          </div>
        </div>
        {review.comment && (
          <p className="max-w-md text-sm italic leading-6 text-muted-foreground">
            &ldquo;{review.comment}&rdquo;
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
          <MessageSquare className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">How was your session?</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Your feedback helps us improve the experience.</p>
        </div>
      </div>
      <ReviewDialog open={open} onOpenChange={setOpen} bookingId={bookingId} />
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Star className="h-4 w-4 text-warning" aria-hidden="true" />
        Leave a review
      </Button>
    </div>
  );
}