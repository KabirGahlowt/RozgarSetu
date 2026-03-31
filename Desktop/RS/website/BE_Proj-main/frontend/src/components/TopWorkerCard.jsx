import React from "react";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { Avatar, AvatarImage } from "./ui/avatar";

const TopWorkerCard = ({ worker }) => {
  const navigate = useNavigate();
  return (
    /*<div
      onClick={() => navigate(`/description/${worker._id}`)}
      className="p-5 rounded-md shadow-xl bg-white border border-gray-100 cursor-pointer"
    >
      <div>
        <h1 className="font-medium text-lg">{worker?.fullname}</h1>
      </div>
      <div>
        <h1 className="font-bold text-lg my-2">Skill</h1>
        <p className="text-sm test-gray-600">{worker?.skills}</p>
      </div>
      <div>
        <h1 className="font-bold text-lg my-2">Address</h1>
        <p className="text-sm test-gray-600">{worker?.address}</p>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <Badge className="text-blue-700 font-bold" variant="ghost">
          {worker?.avaliability}
        </Badge>
        <Badge className="text-[#6A38C2] font-bold" variant="ghost">
          Years of Exp: {worker?.experienceYears}
        </Badge>
      </div>
    </div>*/

    <div
      onClick={() => navigate(`/description/${worker._id}`)}
      className="p-5 rounded-md shadow-xl bg-white border border-gray-100 cursor-pointer"
    >
      {/*Top Section (Avatar + Name + Rating) */}
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={worker?.profilePhoto} />
        </Avatar>

        <div>
          <h1 className="font-medium text-lg">{worker?.fullname}</h1>

          {/*Rating */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={14}
                className={`${
                  star <= Math.round(worker?.avgRating || 0)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">
              ({worker?.avgRating?.toFixed(1) || 0})
            </span>
          </div>
        </div>
      </div>

      {/* 🔹 Skill */}
      <div>
        <h1 className="font-bold text-lg my-2">Skill</h1>
        <p className="text-sm text-gray-600">{worker?.skills}</p>
      </div>

      {/* 🔹 Address */}
      <div>
        <h1 className="font-bold text-lg my-2">Address</h1>
        <p className="text-sm text-gray-600">{worker?.address}</p>
      </div>

      {/* 🔹 Badges */}
      <div className="flex items-center gap-2 mt-4">
        <Badge className="text-blue-700 font-bold" variant="ghost">
          {worker?.avaliability}
        </Badge>
        <Badge className="text-[#6A38C2] font-bold" variant="ghost">
          Years of Exp: {worker?.experienceYears}
        </Badge>
      </div>
    </div>
  );
};

export default TopWorkerCard;
