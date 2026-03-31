import React from "react";
import { Button } from "./ui/button";
import { Bookmark } from "lucide-react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";

const Worker = ({ worker }) => {
  const navigate = useNavigate();
  //const workerId = "thisistheworkerid";

  /*const daysAgoFunction = (mongodbTime) => { its a days ago function, could be used for recording the application time later
    const createdAt = new Date(mongodbTime);
    const currentTime = new Date();
    const timeDifference = currentTime - createdAt;
    return Math.floor(timeDifference/(1000*24*60*60));
  }*/

  return (
    <div className="p-5 rounded-md shadow-xl bg-white border border-gray-100">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{worker?.skills}</p>
        <Button variant="outline" className="rounded-full" size="icon">
          <Bookmark />
        </Button>
      </div>

      <div className="flex items-center gap-2 my-2">
        <Button>
          <Avatar>
            <AvatarImage src={worker?.profilePhoto} />
          </Avatar>
        </Button>
        <div>
          <h1 className="font-medium text-lg">{worker?.fullname}</h1>
        </div>
      </div>

      <div>
        <h1 className="font-bold text-lg my-2">Skills</h1>
        <p className="text-sm text-gray-600">{worker?.skills}</p>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <Badge className="text-blue-700 font-bold" variant="ghost">
          {worker?.avaliability}
        </Badge>
        <Badge className="text-[#6A38C2] font-bold" variant="ghost">
          Years of Exp: {worker?.experienceYears}
        </Badge>
      </div>
      <div className="flex items-center gap-4 mt-4">
        <Button
          onClick={() => navigate(`/description/${worker?._id}`)}
          variant="outline"
        >
          Details
        </Button>
        <Button className="bg-[#6A38C2]">Save for Later</Button>
      </div>
    </div>
  );
};

export default Worker;
