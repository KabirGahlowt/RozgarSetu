import React, { useState } from "react";
import Navbar from "../shared/Navbar";
import ClientsWantingToHire from "./ClientsWantingToHire";
import { useSelector } from "react-redux";
import { Pen, Phone, MapPin, Hash, Clock, Award, Star, Briefcase } from "lucide-react";
import UpdateWorkerDialog from "./UpdateWorkerDialog";
import WorkerReviews from "./WorkerReviews";
import useGetWorkerReviews from "../../hooks/useGetWorkerReviews";

const WorkerProfile = () => {
  const { user } = useSelector((store) => store.auth);
  const [open, setOpen] = useState(false);
  const { avgRating, reviews } = useSelector((store) => store.review);
  useGetWorkerReviews(user?._id);

  const infoRows = [
    { icon: Phone,   label: "Phone",        value: user?.phoneNumber },
    { icon: MapPin,  label: "Address",      value: user?.address },
    { icon: Hash,    label: "Pincode",      value: user?.pincode },
    { icon: Clock,   label: "Availability", value: user?.avaliability },
    { icon: Award,   label: "Experience",   value: user?.experienceYears ? `${user.experienceYears} years` : null },
    { icon: Briefcase,label:"Skills",       value: user?.skills },
  ];

  return (
    <div className="rs-page">
      <div className="rs-tricolor" />
      <Navbar />
      <div className="rs-shell-main" style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* Profile card */}
        <div className="rs-glass-strong rs-anim" style={{ borderRadius: "1.5rem", padding: "2rem", marginBottom: "1.5rem" }}>
          <div className="rs-flex-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
              <div style={{
                width: "80px", height: "80px", borderRadius: "50%",
                border: "3px solid rgba(255,153,51,0.5)", overflow: "hidden",
                background: "rgba(255,153,51,0.1)", flexShrink: 0,
              }}>
                {user?.profilePhoto
                  ? <img src={user.profilePhoto} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF9933", fontSize: "2rem", fontWeight: 700 }}>
                      {user?.fullname?.[0]?.toUpperCase() || "W"}
                    </div>
                }
              </div>
              <div>
                <h1 style={{ margin: 0, fontFamily: "var(--rs-font)", fontSize: "1.4rem", fontWeight: 700, color: "#fff" }}>{user?.fullname}</h1>
                <span className="rs-badge-green" style={{ marginTop: "0.35rem", display: "inline-flex", padding: "0.2rem 0.75rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 500, background: "rgba(19,136,8,0.12)", color: "#6ee87b", border: "1px solid rgba(19,136,8,0.25)" }}>
                  Worker
                </span>

                {/* Star rating */}
                <div style={{ display: "flex", alignItems: "center", gap: "3px", marginTop: "0.5rem" }}>
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={13} style={{ color: s <= Math.round(avgRating||0) ? "#FF9933" : "rgba(255,255,255,0.2)", fill: s <= Math.round(avgRating||0) ? "#FF9933" : "transparent" }} />
                  ))}
                  <span style={{ fontSize: "0.75rem", color: "var(--rs-text-muted)", marginLeft: "4px" }}>
                    {avgRating > 0 ? `(${avgRating?.toFixed(1)})` : "Not yet rated"}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(true)} className="rs-btn-outline" style={{ padding: "0.5rem 1rem", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem" }}>
              <Pen size={14} /> Edit
            </button>
          </div>

          <hr className="rs-divider" />

          <div className="rs-grid-2-sm1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem", marginTop: "1rem" }}>
            {infoRows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rs-glass" style={{ padding: "0.85rem 1rem", borderRadius: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Icon size={15} style={{ color: "var(--rs-saffron)", flexShrink: 0 }} />
                <div>
                  <p style={{ margin: 0, fontSize: "0.68rem", color: "var(--rs-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "var(--rs-font)" }}>{label}</p>
                  <p style={{ margin: "0.15rem 0 0", fontSize: "0.88rem", color: "#fff", fontFamily: "var(--rs-font)" }}>{value || "—"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <ClientsWantingToHire />
        <WorkerReviews />
        <UpdateWorkerDialog open={open} setOpen={setOpen} />
      </div>
    </div>
  );
};

export default WorkerProfile;
