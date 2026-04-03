import React, { useEffect, useState } from "react";
import Navbar from "./shared/Navbar";
import Footer from "./shared/Footer";
import axios from "axios";
import { APPLICATION_API_END_POINT, REVIEW_API_END_POINT } from "../utils/constant";
import { useSelector } from "react-redux";
import { Star, Clock, CheckCircle, XCircle, MapPin, Briefcase, Pen, Eye, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReviewDialog from "./ReviewDialog";
import { toast } from "sonner";

const StarDisplay = ({ rating, size = 13 }) => (
  <div style={{ display: "flex", gap: "2px" }}>
    {[1,2,3,4,5].map((s) => (
      <Star key={s} size={size} style={{ color: s <= rating ? "#FF9933" : "rgba(255,255,255,0.18)", fill: s <= rating ? "#FF9933" : "transparent" }} />
    ))}
  </div>
);

const statusConfig = {
  Accepted: { icon: CheckCircle, color: "#6ee87b",  bg: "rgba(19,136,8,0.14)",    border: "rgba(19,136,8,0.3)" },
  Rejected: { icon: XCircle,    color: "#f87171",   bg: "rgba(220,38,38,0.12)",   border: "rgba(220,38,38,0.3)" },
  Pending:  { icon: Clock,      color: "#FF9933",   bg: "rgba(255,153,51,0.12)",  border: "rgba(255,153,51,0.3)" },
  Done:     { icon: CheckCircle,color: "#60a5fa",   bg: "rgba(96,165,250,0.12)",  border: "rgba(96,165,250,0.3)" },
};

const HistoryItem = ({ application, user, onGiveReview, onEditReview }) => {
  const worker = application.worker;
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [loadingReview, setLoadingReview] = useState(true);
  const sc = statusConfig[application.status] || statusConfig.Pending;
  const StatusIcon = sc.icon;

  useEffect(() => {
    if (!worker) return;
    axios.get(`${REVIEW_API_END_POINT}/review/${worker._id}`, { withCredentials: true })
      .then((res) => {
        if (res.data.success) {
          const clientReview = res.data.reviews.find((r) => r.client._id === user._id || r.client === user._id);
          setReview(clientReview || null);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingReview(false));
  }, [worker, user._id]);

  if (!worker) return null;

  return (
    <div className="rs-glass-strong" style={{ borderRadius: "1rem", padding: "1.25rem" }}>
      {/* Worker info */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", border: "2px solid rgba(255,153,51,0.4)", overflow: "hidden", background: "rgba(255,153,51,0.1)", flexShrink: 0 }}>
          {worker.profilePhoto
            ? <img src={worker.profilePhoto} alt={worker.fullname} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF9933", fontWeight: 700, fontSize: "1.3rem" }}>{worker.fullname?.[0]?.toUpperCase()}</div>
          }
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontFamily: "var(--rs-font)", fontSize: "1rem", fontWeight: 700, color: "#fff" }}>{worker.fullname}</h3>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.3rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: "var(--rs-text-muted)" }}>
              <Briefcase size={11} /> {worker.skills}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: "var(--rs-text-muted)" }}>
              <MapPin size={11} /> {worker.address}
            </span>
          </div>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
            padding: "0.22rem 0.6rem",
            borderRadius: "999px",
            fontSize: "0.68rem",
            fontWeight: 600,
            background: sc.bg,
            color: sc.color,
            border: `1px solid ${sc.border}`,
            marginRight: "0.6rem",
            marginTop: "0.1rem",
            whiteSpace: "nowrap",
          }}
        >
          <StatusIcon size={11} /> {application.status}
        </span>
      </div>

      {/* Review box */}
      <div className="rs-glass" style={{ padding: "0.85rem", borderRadius: "0.75rem", marginBottom: "0.85rem" }}>
        <p style={{ margin: "0 0 0.4rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--rs-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "var(--rs-font)" }}>Your Review</p>
        {loadingReview
          ? <p style={{ margin: 0, color: "var(--rs-text-muted)", fontSize: "0.82rem" }}>Loading…</p>
          : review
            ? <><StarDisplay rating={review.rating} /><p style={{ margin: "0.35rem 0 0", fontSize: "0.82rem", color: "var(--rs-text-secondary)", fontFamily: "var(--rs-font)" }}>{review.comment || "No comment."}</p></>
            : <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--rs-text-muted)", fontFamily: "var(--rs-font)" }}>You haven't reviewed this worker yet.</p>
        }
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
        {!review && application.status === "Accepted" && (
          <button onClick={() => onGiveReview(worker._id)} className="rs-btn-primary" style={{ padding: "0.45rem 1rem", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <MessageSquare size={13} /> Give Review
          </button>
        )}
        {review && application.status === "Accepted" && (
          <button onClick={() => onEditReview(worker._id, review)} className="rs-btn-outline" style={{ padding: "0.45rem 1rem", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.35rem", borderColor: "rgba(255,153,51,0.5)", color: "#FF9933" }}>
            <Pen size={13} /> Edit Review
          </button>
        )}
        <button onClick={() => navigate(`/description/${worker._id}`)} className="rs-btn-outline" style={{ padding: "0.45rem 1rem", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <Eye size={13} /> View Profile
        </button>
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

  const handleOpenReview  = (id) => { setSelectedWorkerId(id); setEditingReview(null); setOpen(true); };
  const handleEditReview  = (id, review) => { setSelectedWorkerId(id); setEditingReview(review); setOpen(true); };
  const handleClose       = () => { setOpen(false); setSelectedWorkerId(null); setEditingReview(null); };

  useEffect(() => {
    axios.get(`${APPLICATION_API_END_POINT}/client/hires`, { withCredentials: true })
      .then((res) => { if (res.data.success) setHires(res.data.hires); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rs-page">
      <div className="rs-tricolor" />
      <Navbar />
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem 1.5rem", minHeight: "calc(100vh - 120px)" }}>
        <h1 style={{ fontFamily: "var(--rs-font)", fontSize: "1.75rem", fontWeight: 700, color: "#fff", marginBottom: "0.25rem" }}>
          Hiring <span style={{ color: "var(--rs-saffron)" }}>History</span>
        </h1>
        <p style={{ color: "var(--rs-text-muted)", fontSize: "0.84rem", marginBottom: "1.75rem" }}>All your previous and ongoing hire requests</p>

        {loading
          ? <p style={{ color: "var(--rs-text-muted)", fontFamily: "var(--rs-font)" }}>Loading your history…</p>
          : hires.length === 0
            ? <div className="rs-glass" style={{ padding: "3rem", textAlign: "center", borderRadius: "1rem" }}>
                <p style={{ color: "var(--rs-text-muted)", fontFamily: "var(--rs-font)" }}>You have no hiring history yet.</p>
              </div>
            : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
                {hires.map((application) => (
                  <HistoryItem key={application._id} application={application} user={user} onGiveReview={handleOpenReview} onEditReview={handleEditReview} />
                ))}
              </div>
        }
      </div>
      <ReviewDialog open={open} setOpen={handleClose} workerId={selectedWorkerId} existingReview={editingReview} />
      <Footer />
    </div>
  );
};

export default History;
