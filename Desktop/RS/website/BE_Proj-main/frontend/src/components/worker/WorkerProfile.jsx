import React, { useState } from "react";
import Navbar from "../shared/Navbar";
import ClientsWantingToHire from "./ClientsWantingToHire";
import { useSelector } from "react-redux";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Contact, Locate, Mail, Map, Pen, Star } from "lucide-react";
import { Badge } from "../ui/badge";
import UpdateWorkerDialog from "./UpdateWorkerDialog";
import WorkerReviews from "./WorkerReviews";
import useGetWorkerReviews from "../../hooks/useGetWorkerReviews";

const WorkerProfile = () => {
  const { user } = useSelector((store) => store.auth);
  const [open, setOpen] = useState(false);
  const { avgRating, reviews } = useSelector((store) => store.review);

  useGetWorkerReviews(user?._id);

  return (
    <div>
      <Navbar />

      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl my-5 p-8">
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.profilePhoto} />
            </Avatar>
            <div>
              <h1 className="font-medium text-xl">{user?.fullname}</h1>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={18}
                  className={`${star <= Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                />
              ))}
              <span className="text-sm text-gray-600">
                ({avgRating?.toFixed(1) || 0})
              </span>
            </div>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className="text-right"
            variant="outline"
          >
            <Pen />
          </Button>
        </div>
        <div className="my-5">
          <div className="flex items-center gap-3 my-2">
            <b>Phone Number:</b>
            <span>{user?.phoneNumber}</span>
          </div>

          <div className="flex items-center gap-3 my-2">
            <b>Address:</b>
            <span>{user?.address}</span>
          </div>

          <div className="flex items-center gap-3 my-2">
            <b>Pin-code:</b>
            <span>{user?.pincode}</span>
          </div>

          <div className="flex items-center gap-3 my-2">
            <b>Avaliability:</b>
            <span>{user?.avaliability}</span>
          </div>

          <div className="flex items-center gap-3 my-2">
            <b>Years of Experience:</b>
            <span>{user?.experienceYears}</span>
          </div>
        </div>
        {/*Worker skills profile code*/}
        <div className="flex items-center gap-3 my-2">
          <h1>
            <b>Skill:</b>
          </h1>
          {/*<div className="flex items-center gap-1">
            {skills.length != 0 ? (
              skills.map((item, index) => <Badge key={index}>{item}</Badge>)
            ) : (
              <span>NA</span>
            )}
          </div>*/}
          <div className="flex items-center gap-1">
            <Badge>{user?.skills}</Badge>
          </div>
        </div>
      </div>

      <ClientsWantingToHire />
      <WorkerReviews />
      <UpdateWorkerDialog open={open} setOpen={setOpen} />
    </div>
  );
};

export default WorkerProfile;
