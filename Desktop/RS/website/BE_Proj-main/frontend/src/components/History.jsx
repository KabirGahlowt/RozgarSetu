import React, { useEffect, useState } from "react";
import Navbar from "./shared/Navbar";
import Footer from "./shared/Footer";
import axios from "axios";
import { APPLICATION_API_END_POINT, REVIEW_API_END_POINT } from "../utils/constant";
import { useSelector } from "react-redux";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Star } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import ReviewDialog from "./ReviewDialog";
import { toast } from "sonner";

const StarDisplay = ({ rating, size = 14 }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={size}
        className={s <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
      />
    ))}
  </div>
);

const HistoryItem = ({ application, user, onGiveReview, onEditReview }) => {
  const worker = application.worker;
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [loadingReview, setLoadingReview] = useState(true);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await axios.get(`${REVIEW_API_END_POINT}/review/${worker._id}`, {
          withCredentials: true,
        });
        if (res.data.success) {
          const clientReview = res.data.reviews.find(
            (r) => r.client._id === user._id || r.client === user._id
          );
          setReview(clientReview || null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingReview(false);
      }
    };
    if (worker) fetchReview();
  }, [worker, user._id]);

  if (!worker) return null;

  const statusColor =
    application.status === "Accepted"
      ? "bg-green-100 text-green-700"
      : application.status === "Rejected"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <div className="p-5 rounded-md shadow-lg bg-white border border-gray-100 flex flex-col gap-4">
      {/* Worker Info */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={worker.profilePhoto} />
        </Avatar>
        <div className="flex-1">
          <h1 className="font-bold text-lg">{worker.fullname}</h1>
          <p className="text-sm text-gray-500">{worker.skills}</p>
          <p className="text-sm text-gray-500">{worker.address}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
          {application.status}
        </span>
      </div>

      {/* Review Section */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h2 className="font-semibold text-sm mb-2">Your Review</h2>
        {loadingReview ? (
          <p className="text-sm text-gray-400">Loading review...</p>
        ) : review ? (
          <div>
            <StarDisplay rating={review.rating} />
            <p className="text-sm text-gray-600 mt-1">{review.comment || "No comment provided."}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">You haven't reviewed this worker yet.</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-end gap-2 mt-2">
        {/* Give Review — accepted and no review yet */}
        {!review && application.status === "Accepted" && (
          <Button
            onClick={() => onGiveReview(worker._id)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Give Review
          </Button>
        )}

        {/* Edit Review */}
        {review && application.status === "Accepted" && (
          <Button
            onClick={() => onEditReview(worker._id, review)}
            variant="outline"
            className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
          >
            Edit Review
          </Button>
        )}

        <Button onClick={() => navigate(`/description/${worker._id}`)} variant="outline">
          View Profile
        </Button>
      </div>
    </div>
  );
};

const History = () => {
  const { user } = useSelector((store) => store.auth);
  const [hires, setHires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [editingReview, setEditingReview] = useState(null);

  const handleOpenReview = (workerId) => {
    setSelectedWorkerId(workerId);
    setEditingReview(null);
    setOpen(true);
  };

  const handleEditReview = (workerId, review) => {
    setSelectedWorkerId(workerId);
    setEditingReview(review);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedWorkerId(null);
    setEditingReview(null);
  };

  useEffect(() => {
    const fetchHires = async () => {
      try {
        const res = await axios.get(`${APPLICATION_API_END_POINT}/client/hires`, {
          withCredentials: true,
        });
        if (res.data.success) setHires(res.data.hires);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHires();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto my-10 min-h-[60vh]">
        <h1 className="font-bold text-2xl mb-6">Hiring History</h1>
        {loading ? (
          <p>Loading your history...</p>
        ) : hires.length === 0 ? (
          <p className="text-gray-500">You have no hiring history yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hires.map((application) => (
              <HistoryItem
                key={application._id}
                application={application}
                user={user}
                onGiveReview={handleOpenReview}
                onEditReview={handleEditReview}
              />
            ))}
          </div>
        )}
      </div>
      <ReviewDialog
        open={open}
        setOpen={handleClose}
        workerId={selectedWorkerId}
        existingReview={editingReview}
      />
      <Footer />
    </div>
  );
};

export default History;
