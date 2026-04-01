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
      <Dialog open={open}>
        <DialogContent onInteractOutside={() => setOpen(false)}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Your Review" : "Give your review!"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={submitHandler}>
            <div className="space-y-4 py-4">
              <Label className="text-sm font-medium">Rating</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={28}
                    className={`cursor-pointer ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>

              <p className="text-sm text-gray-500">
                {rating ? `${rating} / 5` : "Select Rating"}
              </p>

              <Input
                type="text"
                placeholder="Write your review here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={!rating}>
                {isEditMode ? "Update Review" : "Submit Review"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewDialog;
