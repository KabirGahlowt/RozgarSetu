import React from "react";
import { Badge } from "./ui/badge";

const TopWorkerCard = ({ worker }) => {
  return (
    <div className="p-5 rounded-md shadow-xl bg-white border border-gray-100 cursor-pointer">
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
    </div>
  );
};

export default TopWorkerCard;
