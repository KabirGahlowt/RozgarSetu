import axios from "axios";
import React, { useState } from "react";
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

const ReviewDialog = ({ open, setOpen, workerId }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const dispatch = useDispatch();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!rating) {
      return toast.error("Please select a rating");
    }

    try {
      const res = await axios.post(
        `${REVIEW_API_END_POINT}/review`,
        { workerId, rating, comment },
        { withCredentials: true },
      );

      if (res.data.success) {
        toast.success(res.data.message);
        dispatch(addReview(res.data.review));
        setOpen(false);
        setRating(0);
        setComment("");
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
            <DialogTitle>Give your review!</DialogTitle>
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
                Submit Review
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewDialog;
