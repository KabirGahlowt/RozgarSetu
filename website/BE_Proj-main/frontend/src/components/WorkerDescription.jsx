import React, { useEffect, useState } from "react";
import Navbar from "./shared/Navbar";
import Footer from "./shared/Footer";
import { useParams } from "react-router-dom";
import axios from "axios";
import { APPLICATION_API_END_POINT, WORKER_API_END_POINT, REVIEW_API_END_POINT } from "../utils/constant";
import { setSingleWorker } from "../redux/workSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import useGetWorkerReviews from "../hooks/useGetWorkerReviews";
import { Star, MapPin, Briefcase, Clock, Award, Phone, Lock, Pen, MessageSquare, CheckCircle, Loader2 } from "lucide-react";
import ReviewDialog from "./ReviewDialog";

const WorkerDescription = () => {
  const { user } = useSelector((store) => store.auth);
  const { singleWorker } = useSelector((store) => store.work);
  const { avgRating, reviews } = useSelector((store) => store.review);
  const [hireStatus, setHireStatus] = useState(null);
  const [myReview, setMyReview] = useState(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [hasAcceptedHire, setHasAcceptedHire] = useState(false);
  const [hiring, setHiring] = useState(false);
  const params = useParams();
  const workerId = params.id;
  useGetWorkerReviews(workerId);
  const dispatch = useDispatch();

  const hireHandler = async () => {
    try {
      setHiring(true);
      const res = await axios.post(`${APPLICATION_API_END_POINT}/hireWorker/${workerId}`, {}, { withCredentials: true });
      if (res.data.success) { setHireStatus("Pending"); toast.success(res.data.message); }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to hire");
    } finally { setHiring(false); }
  };

  useEffect(() => {
    axios.get(`${WORKER_API_END_POINT}/getWorkerById/${workerId}`, { withCredentials: true })
      .then((res) => {
        if (res.data.success) {
          dispatch(setSingleWorker(res.data.worker));
          if (user?.role === "Client") {
            const myApps = res.data.worker.applications.filter((a) => a.client === user?._id);
            const active = myApps.find((a) => ["Pending", "Accepted"].includes(a.status));
            setHireStatus(active ? active.status : null);
            setHasAcceptedHire(!!myApps.find((a) => a.status === "Accepted"));
          }
        }
      }).catch(console.log);
  }, [workerId, dispatch, user?._id]);

  useEffect(() => {
    if (!user || user.role !== "Client") return;
    axios.get(`${REVIEW_API_END_POINT}/review/${workerId}`, { withCredentials: true })
      .then((res) => {
        if (res.data.success) {
          const found = res.data.reviews.find((r) => r.client._id === user._id || r.client === user._id);
          setMyReview(found || null);
        }
      }).catch(console.log);
  }, [workerId, user]);

  const isActiveHire = hireStatus === "Pending" || hireStatus === "Accepted";

  const infoRows = [
    { icon: Briefcase, label: "Skills",       value: singleWorker?.skills },
    { icon: Award,     label: "Experience",   value: singleWorker?.experienceYears ? `${singleWorker.experienceYears} years` : null },
    { icon: Clock,     label: "Availability", value: singleWorker?.avaliability },
    { icon: MapPin,    label: "Address",      value: singleWorker?.address },
  ];

  return (
    <div className="rs-page">
      <div className="rs-tricolor" />
      <Navbar />
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Top Hero Card */}
        <div className="rs-glass-strong rs-anim" style={{ borderRadius: "1.5rem", padding: "2rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1.5rem", flexWrap: "wrap" }}>
            {/* Left */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
              <div style={{ width: "88px", height: "88px", borderRadius: "50%", border: "3px solid rgba(255,153,51,0.5)", overflow: "hidden", background: "rgba(255,153,51,0.1)", flexShrink: 0 }}>
                {singleWorker?.profilePhoto
                  ? <img src={singleWorker.profilePhoto} alt="worker" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF9933", fontSize: "2.2rem", fontWeight: 700 }}>{singleWorker?.fullname?.[0]}</div>
                }
              </div>
              <div>
                <h1 style={{ margin: 0, fontFamily: "var(--rs-font)", fontSize: "1.5rem", fontWeight: 700, color: "#fff" }}>{singleWorker?.fullname}</h1>
                <div style={{ display: "flex", alignItems: "center", gap: "3px", marginTop: "0.4rem" }}>
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={14} style={{ color: s <= Math.round(avgRating||0) ? "#FF9933" : "rgba(255,255,255,0.2)", fill: s <= Math.round(avgRating||0) ? "#FF9933" : "transparent" }} />
                  ))}
                  <span style={{ fontSize: "0.78rem", color: "var(--rs-text-muted)", marginLeft: "5px" }}>({avgRating?.toFixed(1) || 0})</span>
                </div>
              </div>
            </div>

            {/* Right — Client actions */}
            {user?.role === "Client" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", alignItems: "flex-end" }}>
                <button
                  onClick={isActiveHire ? undefined : hireHandler}
                  disabled={isActiveHire || hiring}
                  className={isActiveHire ? "rs-btn-outline" : "rs-btn-primary"}
                  style={{ padding: "0.6rem 1.4rem", display: "flex", alignItems: "center", gap: "0.4rem", opacity: isActiveHire ? 0.7 : 1, cursor: isActiveHire ? "not-allowed" : "pointer" }}
                >
                  {hiring ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />Sending…</>
                   : isActiveHire ? <><CheckCircle size={14} />{hireStatus === "Pending" ? "Request Pending…" : "Hired (In Progress)"}</>
                   : "Hire Now"}
                </button>
                {hasAcceptedHire && !myReview && (
                  <button onClick={() => { setEditingReview(null); setReviewDialogOpen(true); }} className="rs-btn-primary" style={{ padding: "0.5rem 1.2rem", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.35rem", background: "linear-gradient(135deg,#138808,#0d6606)" }}>
                    <MessageSquare size={13} /> Give Review
                  </button>
                )}
                {myReview && (
                  <button onClick={() => { setEditingReview(myReview); setReviewDialogOpen(true); }} className="rs-btn-outline" style={{ padding: "0.5rem 1.2rem", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.35rem", borderColor: "rgba(255,153,51,0.5)", color: "#FF9933" }}>
                    <Pen size={13} /> Edit Review
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Worker details */}
        <div className="rs-glass-strong rs-anim rs-anim-d1" style={{ borderRadius: "1.5rem", padding: "1.75rem", marginBottom: "1.5rem" }}>
          <h2 style={{ margin: "0 0 1rem", fontFamily: "var(--rs-font)", fontSize: "1rem", fontWeight: 700, color: "#fff" }}>
            Worker <span style={{ color: "var(--rs-saffron)" }}>Details</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
            {infoRows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rs-glass" style={{ padding: "0.85rem 1rem", borderRadius: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Icon size={15} style={{ color: "var(--rs-saffron)", flexShrink: 0 }} />
                <div>
                  <p style={{ margin: 0, fontSize: "0.68rem", color: "var(--rs-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "var(--rs-font)" }}>{label}</p>
                  <p style={{ margin: "0.1rem 0 0", fontSize: "0.88rem", color: "#fff", fontFamily: "var(--rs-font)" }}>{value || "—"}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact info */}
          <div style={{ marginTop: "1rem" }}>
            {singleWorker?.phoneNumber ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", background: "rgba(19,136,8,0.12)", border: "1px solid rgba(19,136,8,0.3)", borderRadius: "0.75rem" }}>
                <Phone size={15} style={{ color: "#6ee87b" }} />
                <span style={{ fontWeight: 600, color: "#6ee87b", fontFamily: "var(--rs-font)" }}>{singleWorker.phoneNumber}</span>
                <span style={{ fontSize: "0.72rem", color: "rgba(110,232,123,0.6)", marginLeft: "0.25rem" }}>(Hire accepted)</span>
              </div>
            ) : user?.role === "Client" && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem" }}>
                <Lock size={14} style={{ color: "var(--rs-text-muted)" }} />
                <span style={{ fontSize: "0.82rem", color: "var(--rs-text-muted)", fontFamily: "var(--rs-font)" }}>Contact info visible after hire is accepted</span>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="rs-glass-strong rs-anim rs-anim-d2" style={{ borderRadius: "1.5rem", padding: "1.75rem" }}>
          <h2 style={{ margin: "0 0 1rem", fontFamily: "var(--rs-font)", fontSize: "1rem", fontWeight: 700, color: "#fff" }}>
            Reviews <span style={{ color: "var(--rs-saffron)" }}>({reviews.length})</span>
          </h2>
          {reviews.length === 0 ? (
            <p style={{ color: "var(--rs-text-muted)", fontSize: "0.84rem", fontFamily: "var(--rs-font)" }}>No reviews yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {reviews.map((review) => (
                <div key={review._id} className="rs-glass" style={{ padding: "1rem", borderRadius: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1.5px solid rgba(255,153,51,0.3)", overflow: "hidden", background: "rgba(255,153,51,0.1)", flexShrink: 0 }}>
                      {review?.client?.profilePhoto
                        ? <img src={review.client.profilePhoto} alt={review.client.fullname} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF9933", fontWeight: 700 }}>{review?.client?.fullname?.[0]}</div>
                      }
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: "0.88rem", color: "#fff", fontFamily: "var(--rs-font)" }}>{review?.client?.fullname}</p>
                      <div style={{ display: "flex", gap: "2px", marginTop: "2px" }}>
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} size={11} style={{ color: s <= review.rating ? "#FF9933" : "rgba(255,255,255,0.18)", fill: s <= review.rating ? "#FF9933" : "transparent" }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  {review.comment && <p style={{ margin: 0, fontSize: "0.84rem", color: "var(--rs-text-secondary)", fontFamily: "var(--rs-font)", lineHeight: 1.5 }}>{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <ReviewDialog open={reviewDialogOpen} setOpen={setReviewDialogOpen} workerId={workerId} existingReview={editingReview} />
      <Footer />
    </div>
  );
};

export default WorkerDescription;
