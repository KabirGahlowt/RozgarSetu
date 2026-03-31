import React from "react";
import { useSelector } from "react-redux";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Star } from "lucide-react";

const WorkerReviews = () => {
  const { reviews } = useSelector((store) => store.review);
  return (
    <div className="max-w-4xl mx-auto my-10">
      <h1 className="font-bold text-xl mb-5">Reviews ({reviews.length})</h1>

      <div className="space-y-5">
        {reviews.map((review) => (
          <div key={review._id} className="border p-4 rounded-xl bg-white">
            <div className="flex items-center gap-3 mb-2">
              <Avatar>
                <AvatarImage src={review?.client?.profilePhoto} />
              </Avatar>
              <span className="font-medium">{review?.client?.fullname}</span>
            </div>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={`${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>
            <p className="text-gray-700">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkerReviews;
