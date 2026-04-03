import React from "react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { useNavigate } from "react-router-dom";
import { Star, MapPin, Briefcase, Clock } from "lucide-react";

const Worker = ({ worker }) => {
  const navigate = useNavigate();

  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
  const rating = worker?.avgRating || 0;

  return (
    <div
      className="rs-glass rs-worker-card"
      onClick={() => navigate(`/description/${worker?._id}`)}
      style={{ cursor: "pointer" }}
    >
      {/* Top row: avatar + name + rating */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem", marginBottom: "0.85rem" }}>
        <div style={{
          width: "48px", height: "48px", borderRadius: "50%",
          border: "2px solid rgba(255,153,51,0.4)",
          overflow: "hidden", flexShrink: 0,
          background: "rgba(255,153,51,0.1)",
        }}>
          {worker?.profilePhoto
            ? <img src={worker.profilePhoto} alt={worker.fullname} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF9933", fontWeight: 700, fontSize: "1.1rem" }}>
                {worker?.fullname?.[0]?.toUpperCase() || "?"}
              </div>
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: 0, color: "#fff", fontWeight: 600, fontSize: "0.95rem", fontFamily: "var(--rs-font)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {worker?.fullname}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "2px", marginTop: "3px" }}>
            {stars.map((s) => (
              <Star key={s} size={11} style={{ color: s <= Math.round(rating) ? "#FF9933" : "rgba(255,255,255,0.2)", fill: s <= Math.round(rating) ? "#FF9933" : "transparent" }} />
            ))}
            <span style={{ fontSize: "0.7rem", color: "var(--rs-text-muted)", marginLeft: "4px" }}>
              {rating > 0 ? `(${rating.toFixed(1)})` : "New"}
            </span>
          </div>
        </div>
      </div>

      {/* Location */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.6rem" }}>
        <MapPin size={12} style={{ color: "var(--rs-text-muted)", flexShrink: 0 }} />
        <span style={{ fontSize: "0.78rem", color: "var(--rs-text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {worker?.address}
        </span>
      </div>

      {/* Skills */}
      <div style={{ marginBottom: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.3rem" }}>
          <Briefcase size={12} style={{ color: "rgba(255,153,51,0.7)" }} />
          <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "rgba(255,153,51,0.8)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Skills</span>
        </div>
        <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--rs-text-secondary)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {worker?.skills}
        </p>
      </div>

      {/* Badges row */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <span className="rs-badge-green" style={{
          display: "inline-flex", alignItems: "center", gap: "0.25rem",
          padding: "0.2rem 0.65rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 500,
          background: "rgba(19,136,8,0.12)", color: "#6ee87b", border: "1px solid rgba(19,136,8,0.25)"
        }}>
          <Clock size={10} /> {worker?.avaliability}
        </span>
        <span className="rs-badge" style={{ padding: "0.2rem 0.65rem", fontSize: "0.7rem" }}>
          {worker?.experienceYears} yrs exp
        </span>
      </div>

      {/* CTA */}
      <button
        onClick={(e) => { e.stopPropagation(); navigate(`/description/${worker?._id}`); }}
        className="rs-btn-outline"
        style={{ width: "100%", padding: "0.5rem", fontSize: "0.82rem", borderRadius: "0.6rem" }}
      >
        View Profile →
      </button>
    </div>
  );
};

export default Worker;
