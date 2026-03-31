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

const WorkerDescription = () => {
  const { user } = useSelector((store) => store.auth);
  const { singleWorker } = useSelector((store) => store.work);
  const isInitiallyHired =
    singleWorker &&
    singleWorker.applications &&
    singleWorker.applications.some(
      (application) => application.applicant === user?._id,
    );
  const [isHired, setIsHired] = useState(isInitiallyHired);

  const params = useParams();
  const workerId = params.id;
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
          applications: [
            ...singleWorker.applications,
            { applicant: user?._id },
          ],
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
              (application) => application.applicant === user?._id,
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
              <p className="text-gray-500">
                Some description about worker will come here
              </p>
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
      <Footer />
    </div>
  );
};

export default WorkerDescription;
