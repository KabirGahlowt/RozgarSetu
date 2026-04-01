import React, { useEffect, useState } from "react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import Footer from "./shared/Footer";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  APPLICATION_API_END_POINT,
  WORKER_API_END_POINT,
  REVIEW_API_END_POINT,
} from "../utils/constant";
import { setSingleWorker } from "../redux/workSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import useGetWorkerReviews from "../hooks/useGetWorkerReviews";
import { Star } from "lucide-react";
import ReviewDialog from "./ReviewDialog";

const WorkerDescription = () => {
  const { user } = useSelector((store) => store.auth);
  const { singleWorker } = useSelector((store) => store.work);
  const { avgRating, reviews } = useSelector((store) => store.review);

  // Hire state tracking
  // Scenario 1: No active hire → show "Hire Now"
  // Scenario 2: Pending or Accepted → show "Currently Hired / Pending" (disabled)
  // Scenario 3: Completed → "Hire Now" works again (re-hire)
  const [hireStatus, setHireStatus] = useState(null); // null | "Pending" | "Accepted" | "Completed" | "Rejected"

  // Review state
  const [myReview, setMyReview] = useState(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [hasAcceptedHire, setHasAcceptedHire] = useState(false);

  const params = useParams();
  const workerId = params.id;
  useGetWorkerReviews(workerId);
  const dispatch = useDispatch();

  const hireHandler = async () => {
    try {
      const res = await axios.post(
        `${APPLICATION_API_END_POINT}/hireWorker/${workerId}`,
        {},
        { withCredentials: true },
      );
      if (res.data.success) {
        setHireStatus("Pending");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to hire");
    }
  };

  useEffect(() => {
    const fetchSingleWorker = async () => {
      try {
        const res = await axios.get(
          `${WORKER_API_END_POINT}/getWorkerById/${workerId}`,
          { withCredentials: true },
        );
        if (res.data.success) {
          dispatch(setSingleWorker(res.data.worker));

          // Find this client's most recent application to determine status
          if (user?.role === "Client") {
            const myApps = res.data.worker.applications.filter(
              (a) => a.client === user?._id
            );
            // Check for any active (blocking) hire
            const active = myApps.find((a) => ["Pending", "Accepted"].includes(a.status));
            if (active) {
              setHireStatus(active.status);
            } else {
              // Not blocked — allow fresh hire (covers Completed, Rejected, or no history)
              setHireStatus(null);
            }
            // Has any accepted → can review
            const accepted = myApps.find((a) => a.status === "Accepted");
            setHasAcceptedHire(!!accepted);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchSingleWorker();
  }, [workerId, dispatch, user?._id]);

  // Fetch this client's review
  useEffect(() => {
    const fetchMyReview = async () => {
      if (!user || user.role !== "Client") return;
      try {
        const res = await axios.get(`${REVIEW_API_END_POINT}/review/${workerId}`, {
          withCredentials: true,
        });
        if (res.data.success) {
          const found = res.data.reviews.find(
            (r) => r.client._id === user._id || r.client === user._id
          );
          setMyReview(found || null);
        }
      } catch (e) {
        console.log(e);
      }
    };
    fetchMyReview();
  }, [workerId, user]);

  const isActiveHire = hireStatus === "Pending" || hireStatus === "Accepted";

  const hireButtonLabel = () => {
    if (hireStatus === "Pending") return "Request Pending…";
    if (hireStatus === "Accepted") return "Hired (In Progress)";
    return "Hire Now";
  };

  return (
    <div className="max-w-7xl mx-auto my-10">
      {/* Top Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6">
        <div className="flex items-center justify-between">
          {/* Left Side */}
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

          {/* Right Side — Client-only actions */}
          {user?.role === "Client" && (
            <div className="flex flex-col gap-2 items-end">
              {/* Single Hire Button — the 3 scenarios are handled via label + disabled */}
              <Button
                onClick={isActiveHire ? undefined : hireHandler}
                disabled={isActiveHire}
                className={`rounded-lg ${
                  isActiveHire
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-[#7209b7] hover:bg-[#5f32ad]"
                }`}
              >
                {hireButtonLabel()}
              </Button>

              {/* Review actions — only if had an accepted hire */}
              {hasAcceptedHire && !myReview && (
                <Button
                  onClick={() => { setEditingReview(null); setReviewDialogOpen(true); }}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  Give Review
                </Button>
              )}
              {myReview && (
                <Button
                  onClick={() => { setEditingReview(myReview); setReviewDialogOpen(true); }}
                  variant="outline"
                  className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                >
                  Edit Review
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <h1 className="border-b-2 border-b-gray-300 font-medium py-4">
        Worker Description
      </h1>
      <div className="my-4">
        <h1 className="font-bold my-1">
          Skills: <span className="font-normal text-gray-500">{singleWorker?.skills}</span>
        </h1>
        <h1 className="font-bold my-1">
          Years of experience: <span className="font-normal text-gray-500">{singleWorker?.experienceYears}</span>
        </h1>
        <h1 className="font-bold my-1">
          Availability: <span className="font-normal text-gray-500">{singleWorker?.avaliability}</span>
        </h1>
        <h1 className="font-bold my-1">
          Address: <span className="font-normal text-gray-500">{singleWorker?.address}</span>
        </h1>
        {/* Phone number — only shown when client has an accepted hire */}
        {singleWorker?.phoneNumber ? (
          <div className="mt-3 flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl w-fit">
            <span className="text-green-600 font-bold text-sm">📞 Contact:</span>
            <span className="font-semibold text-green-800">{singleWorker.phoneNumber}</span>
            <span className="text-xs text-green-500 ml-1">(Hire accepted)</span>
          </div>
        ) : (
          user?.role === "Client" && (
            <div className="mt-3 flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl w-fit text-sm text-gray-400">
              🔒 Contact info visible after hire is accepted
            </div>
          )
        )}
      </div>

      {/* Reviews */}
      <div className="mt-8">
        <h1 className="font-bold text-lg mb-4">Reviews ({reviews.length})</h1>
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={review?.client?.profilePhoto} />
                  </Avatar>
                  <h2 className="font-medium">{review?.client?.fullname}</h2>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={`${
                        star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 mt-2">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <ReviewDialog
        open={reviewDialogOpen}
        setOpen={setReviewDialogOpen}
        workerId={workerId}
        existingReview={editingReview}
      />
      <Footer />
    </div>
  );
};

export default WorkerDescription;
