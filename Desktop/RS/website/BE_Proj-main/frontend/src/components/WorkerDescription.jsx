import React, { useEffect, useState } from "react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import Footer from "./shared/Footer";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  APPLICATION_API_END_POINT,
  WORKER_API_END_POINT,
} from "../utils/constant";
import { setSingleWorker } from "../redux/workSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import useGetWorkerReviews from "../hooks/useGetWorkerReviews";
import { Star } from "lucide-react";

const WorkerDescription = () => {
  const { user } = useSelector((store) => store.auth);
  const { singleWorker } = useSelector((store) => store.work);
  const { avgRating, reviews } = useSelector((store) => store.review);

  const isInitiallyHired =
    singleWorker &&
    singleWorker.applications &&
    singleWorker.applications.some(
      (application) => application.client === user?._id,
    );
  const [isHired, setIsHired] = useState(isInitiallyHired);

  const params = useParams();
  const workerId = params.id;
  useGetWorkerReviews(workerId);
  const dispatch = useDispatch();

  const applyWorkerHandler = async () => {
    try {
      const res = await axios.post(
        `${APPLICATION_API_END_POINT}/hireWorker/${workerId}`,
        {},
        { withCredentials: true },
      );
      console.log(res.data);
      if (res.data.success) {
        setIsHired(true); //Update the local state
        const updatedSingleWorker = {
          ...singleWorker,
          applications: [...singleWorker.applications, { client: user?._id }],
        };
        dispatch(setSingleWorker(updatedSingleWorker)); //enables real time UI updation
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    const fetchSingleWorker = async () => {
      try {
        const res = await axios.get(
          `${WORKER_API_END_POINT}/getWorkerById/${workerId}`,
          {
            withCredentials: true,
          },
        );
        if (res.data.success) {
          dispatch(setSingleWorker(res.data.worker));
          setIsHired(
            res.data.worker.applications.some(
              (application) => application.client === user?._id,
            ),
          ); //Ensures the state is in sync with fetched data
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchSingleWorker();
  }, [workerId, dispatch, user?._id]);

  return (
    <div className="max-w-7xl mx-auto my-10">
      {/* Top Card Section (Profile Style) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6">
        <div className="flex items-center justify-between">
          {/* Left Side (Avatar + Name + Description) */}
          <div className="flex items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={singleWorker?.profilePhoto} alt="worker" />
            </Avatar>
            <div>
              <h1 className="font-bold text-2xl">{singleWorker?.fullname}</h1>
              <div className="flex items-center gap-2 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    className={`${
                      star <= Math.round(avgRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="text-sm text-gray-600">
                  ({avgRating?.toFixed(1) || 0})
                </span>
              </div>
            </div>
          </div>

          {/* Right Side (Hire Button stays same position) */}
          <Button
            onClick={isHired ? null : applyWorkerHandler}
            disabled={isHired}
            className={`rounded-lg ${
              isHired
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-[#7209b7] hover:bg-[#5f32ad]"
            }`}
          >
            {isHired ? "Already Hired" : "Hire Now"}
          </Button>
        </div>
      </div>

      {/* Worker Description Section (Kept Exactly Same) */}
      <h1 className="border-b-2 border-b-gray-300 font-medium py-4">
        Worker Description
      </h1>

      <div className="my-4">
        <h1 className="font-bold my-1">
          Skills:{" "}
          <span className="font-normal text-gray-500">
            {singleWorker?.skills}
          </span>
        </h1>

        <h1 className="font-bold my-1">
          Years of experience:
          <span className="font-normal text-gray-500">
            {singleWorker?.experienceYears}
          </span>
        </h1>

        <h1 className="font-bold my-1">
          Availability:
          <span className="font-normal text-gray-500">
            {singleWorker?.avaliability}
          </span>
        </h1>

        <h1 className="font-bold my-1">
          Address:
          <span className="font-normal text-gray-500">
            {singleWorker?.address}
          </span>
        </h1>
      </div>

      <div className="mt-8">
        <h1 className="font-bold text-lg mb-4">Reviews ({reviews.length})</h1>

        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={review?.client?.profilePhoto} />
                  </Avatar>
                  <h2 className="font-medium">{review?.client?.fullname}</h2>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={`${
                        star <= review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-gray-600 mt-2">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default WorkerDescription;
