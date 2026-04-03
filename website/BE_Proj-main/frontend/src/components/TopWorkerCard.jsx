import React from "react";
import { useNavigate } from "react-router-dom";
import { Star, MapPin, Briefcase } from "lucide-react";

const TopWorkerCard = ({ worker }) => {
  const navigate = useNavigate();
  const rating = worker?.avgRating || 0;

  return (
    <div
      className="rs-glass rs-worker-card"
      onClick={() => navigate(`/description/${worker._id}`)}
    >
      {/* Avatar + Name + Stars */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "0.85rem" }}>
        <div style={{
          width: "52px", height: "52px", borderRadius: "50%",
          border: "2px solid rgba(255,153,51,0.45)",
          overflow: "hidden", flexShrink: 0,
          background: "rgba(255,153,51,0.1)",
        }}>
          {worker?.profilePhoto
            ? <img src={worker.profilePhoto} alt={worker.fullname} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF9933", fontWeight: 700, fontSize: "1.2rem" }}>
                {worker?.fullname?.[0]?.toUpperCase() || "?"}
              </div>
          }
        </div>
        <div>
          <h3 style={{ margin: 0, color: "#fff", fontWeight: 600, fontSize: "0.95rem", fontFamily: "var(--rs-font)" }}>
            {worker?.fullname}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "2px", marginTop: "3px" }}>
            {[1,2,3,4,5].map((s) => (
              <Star key={s} size={11} style={{ color: s <= Math.round(rating) ? "#FF9933" : "rgba(255,255,255,0.2)", fill: s <= Math.round(rating) ? "#FF9933" : "transparent" }} />
            ))}
            <span style={{ fontSize: "0.7rem", color: "var(--rs-text-muted)", marginLeft: "4px" }}>
              {rating > 0 ? `(${rating.toFixed(1)})` : "New"}
            </span>
          </div>
        </div>
      </div>

      {/* Skill */}
      <div style={{ marginBottom: "0.6rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginBottom: "0.2rem" }}>
          <Briefcase size={11} style={{ color: "rgba(255,153,51,0.7)" }} />
          <span style={{ fontSize: "0.68rem", color: "rgba(255,153,51,0.8)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Skill</span>
        </div>
        <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--rs-text-secondary)" }}>{worker?.skills}</p>
      </div>

      {/* Address */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginBottom: "0.75rem" }}>
        <MapPin size={11} style={{ color: "var(--rs-text-muted)" }} />
        <span style={{ fontSize: "0.78rem", color: "var(--rs-text-muted)" }}>{worker?.address}</span>
      </div>

      {/* Badges */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <span style={{ padding: "0.2rem 0.65rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 500, background: "rgba(19,136,8,0.12)", color: "#6ee87b", border: "1px solid rgba(19,136,8,0.25)" }}>
          {worker?.avaliability}
        </span>
        <span className="rs-badge" style={{ fontSize: "0.7rem", padding: "0.2rem 0.65rem" }}>
          {worker?.experienceYears} yrs exp
        </span>
      </div>
    </div>
  );
};

export default TopWorkerCard;
