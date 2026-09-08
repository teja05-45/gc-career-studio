"use client";

import * as React from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/ui/star-rating";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { submitReview } from "@/app/dashboard/appointments/[id]/review/actions";

type ReviewState =
  | { phase: "form" }
  | { phase: "submitting" }
  | { phase: "done"; rating: number };

/**
 * Accessible post-session review dialog. Only mounted for COMPLETED bookings;
 * the server action re-verifies ownership, status, and the one-review-per-
 * booking rule regardless of what the UI shows.
 */
export function ReviewDialog({
  open,
  onOpenChange,
  bookingId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
}) {
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState("");
  const [state, setState] = React.useState<ReviewState>({ phase: "form" });

  // Reset the form each time the dialog opens fresh.
  React.useEffect(() => {
    if (open) {
      setRating(0);
      setComment("");
      setState({ phase: "form" });
    }
  }, [open]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (rating === 0) {
      toast({ title: "Please select a rating", description: "Choose a rating from 1 to 5 stars.", variant: "info" });
      return;
    }
    setState({ phase: "submitting" });
    const result = await submitReview({ bookingId, rating, comment });
    if (result.success) {
      setState({ phase: "done", rating: result.rating });
    } else {
      setState({ phase: "form" });
      toast({ title: "Unable to submit your review", description: result.error, variant: "error" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => {
      onOpenChange(next);
      if (!next && state.phase !== "submitting") setState({ phase: "form" });
    }}>
      <DialogContent className="max-w-md">
        {state.phase === "done" ? (
          <div className="py-2 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
            <DialogTitle className="mt-4 text-center">Thank you for your feedback</DialogTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              Your review helps us keep improving the experience for every candidate.
            </p>
            <div className="mt-5 flex items-center justify-center">
              <StarRating value={state.rating} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Your rating: {state.rating}/5</p>
            <DialogClose asChild>
              <Button className="mt-6 w-full">Close</Button>
            </DialogClose>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <DialogHeader>
              <DialogTitle>How was your session?</DialogTitle>
              <DialogDescription>
                Your feedback helps us improve the experience.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 space-y-5">
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-foreground">Rate your session</legend>
                <StarRating value={rating} onChange={setRating} size="lg" />
              </fieldset>

              <div>
                <Label htmlFor="review-comment" className="mb-1.5 block text-sm font-medium text-foreground">
                  Tell us about your session <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="review-comment"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={2000}
                  placeholder="What went well? What could we improve?"
                />
              </div>

              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="ghost">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={state.phase === "submitting"}>
                  {state.phase === "submitting" ? (
                    <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Submitting…</>
                  ) : (
                    "Submit review"
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}