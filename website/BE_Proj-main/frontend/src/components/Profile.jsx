import React, { useState } from "react";
import Navbar from "./shared/Navbar";
import HiredWorkerTable from "./HiredWorkerTable";
import UpdateProfileDialog from "./UpdateProfileDialog";
import { useSelector } from "react-redux";
import useGetClientHires from "../hooks/useGetClientHires";
import { Pen, Mail, Phone, MapPin, Hash, User } from "lucide-react";
import Footer from "./shared/Footer";

const Profile = () => {
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  useGetClientHires();

  const infoRows = [
    { icon: Mail,   label: "Email",        value: user?.email },
    { icon: Phone,  label: "Phone",        value: user?.phoneNumber },
    { icon: MapPin, label: "Address",      value: user?.address },
    { icon: Hash,   label: "Pincode",      value: user?.pincode },
  ];

  return (
    <div className="rs-page">
      <div className="rs-tricolor" />
      <Navbar />
      <div className="rs-shell-main" style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* Profile Card */}
        <div className="rs-glass-strong rs-anim" style={{ borderRadius: "1.5rem", padding: "2rem", marginBottom: "1.5rem" }}>
          <div className="rs-flex-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
              {/* Avatar */}
              <div style={{
                width: "80px", height: "80px", borderRadius: "50%",
                border: "3px solid rgba(255,153,51,0.5)", overflow: "hidden",
                background: "rgba(255,153,51,0.1)", flexShrink: 0,
              }}>
                {user?.profilePhoto
                  ? <img src={user.profilePhoto} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF9933", fontSize: "2rem", fontWeight: 700 }}>
                      {user?.fullname?.[0]?.toUpperCase() || <User />}
                    </div>
                }
              </div>
              <div>
                <h1 style={{ margin: 0, fontFamily: "var(--rs-font)", fontSize: "1.4rem", fontWeight: 700, color: "#fff" }}>{user?.fullname}</h1>
                <span className="rs-badge" style={{ marginTop: "0.4rem", display: "inline-flex" }}>Client</span>
              </div>
            </div>
            <button
              onClick={() => setOpen(true)}
              className="rs-btn-outline"
              style={{ padding: "0.5rem 1rem", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem" }}
            >
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

        {/* Hired Workers Table */}
        <div className="rs-glass-strong rs-anim rs-anim-d1" style={{ borderRadius: "1.5rem", padding: "1.5rem" }}>
          <h2 style={{ margin: "0 0 1rem", fontFamily: "var(--rs-font)", fontSize: "1.05rem", fontWeight: 600, color: "#fff" }}>
            Workers <span style={{ color: "var(--rs-saffron)" }}>Hired</span>
          </h2>
          <HiredWorkerTable />
        </div>
      </div>
      <UpdateProfileDialog open={open} setOpen={setOpen} />
    </div>
  );
};

export default Profile;
