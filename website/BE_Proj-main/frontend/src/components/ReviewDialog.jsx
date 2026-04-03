import axios from "axios";
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { REVIEW_API_END_POINT } from "../utils/constant";
import { toast } from "sonner";
import { addReview } from "../redux/reviewSlice";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Star } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

// existingReview: if provided, we're in edit mode (PUT). Otherwise create mode (POST).
const ReviewDialog = ({ open, setOpen, workerId, existingReview = null }) => {
  const isEditMode = !!existingReview;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const dispatch = useDispatch();

  // Pre-populate when editing
  useEffect(() => {
    if (isEditMode && existingReview) {
      setRating(existingReview.rating || 0);
      setComment(existingReview.comment || "");
    } else {
      setRating(0);
      setComment("");
    }
  }, [existingReview, open]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!rating) {
      return toast.error("Please select a rating");
    }

    try {
      let res;
      if (isEditMode) {
        // Update existing review via PUT
        res = await axios.put(
          `${REVIEW_API_END_POINT}/review`,
          { workerId, rating, comment },
          { withCredentials: true }
        );
      } else {
        // Create new review via POST
        res = await axios.post(
          `${REVIEW_API_END_POINT}/review`,
          { workerId, rating, comment },
          { withCredentials: true }
        );
      }

      if (res.data.success) {
        toast.success(res.data.message);
        if (!isEditMode) dispatch(addReview(res.data.review));
        setOpen(false);
        setRating(0);
        setComment("");
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
    }
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={(v) => !v && setOpen(false)}>
        <DialogContent
          onInteractOutside={() => setOpen(false)}
          className={cn(
            "border border-[rgba(255,153,51,0.28)] bg-[rgba(2,8,30,0.96)] backdrop-blur-xl text-white shadow-[0_20px_60px_rgba(0,0,0,0.55)] sm:max-w-md",
            "[&_input]:bg-[rgba(255,255,255,0.06)] [&_input]:border-[rgba(255,153,51,0.2)] [&_input]:text-white [&_input]:placeholder:text-[rgba(255,255,255,0.35)]"
          )}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white" style={{ fontFamily: "'Poppins',sans-serif" }}>
              {isEditMode ? "Edit your review" : "Write a review"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={submitHandler}>
            <div className="space-y-4 py-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-[rgba(255,255,255,0.5)]">Rating</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={28}
                    className="cursor-pointer transition-transform hover:scale-105"
                    style={{
                      color: star <= rating ? "#FF9933" : "rgba(255,255,255,0.25)",
                      fill: star <= rating ? "#FF9933" : "transparent",
                    }}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>

              <p className="text-sm text-[rgba(255,255,255,0.45)]" style={{ fontFamily: "'Poppins',sans-serif" }}>
                {rating ? `${rating} / 5` : "Select a star rating"}
              </p>

              <Input
                type="text"
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="rounded-lg"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex cursor-pointer items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition-colors"
                style={{
                  fontFamily: "'Poppins',sans-serif",
                  border: "1px solid rgba(255,153,51,0.55)",
                  background: "rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.95)",
                  boxShadow: "0 0 0 1px rgba(0,0,0,0.2) inset",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,153,51,0.2)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.95)";
                }}
              >
                Cancel
              </button>
              <Button type="submit" disabled={!rating} className="rs-btn-primary border-0">
                {isEditMode ? "Update review" : "Submit review"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewDialog;
