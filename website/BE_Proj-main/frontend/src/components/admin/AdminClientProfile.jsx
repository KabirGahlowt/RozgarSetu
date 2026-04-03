import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import axios from "axios";
import { ADMIN_API_END_POINT } from "../../utils/constant";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MapPin, Hash, User } from "lucide-react";

const AdminClientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${ADMIN_API_END_POINT}/client/${id}`, { withCredentials: true })
      .then((res) => {
        if (res.data.success) setUser(res.data.user);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const infoRows = [
    { icon: Mail, label: "Email", value: user?.email },
    { icon: Phone, label: "Phone", value: user?.phoneNumber != null ? String(user.phoneNumber) : null },
    { icon: MapPin, label: "Address", value: user?.address },
    { icon: Hash, label: "City / Pincode", value: [user?.city, user?.pincode != null ? String(user.pincode) : null].filter(Boolean).join(" · ") || null },
  ];

  if (loading) {
    return (
      <div className="rs-page" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="rs-tricolor" />
        <Navbar />
        <p style={{ color: "var(--rs-text-muted)", fontFamily: "var(--rs-font)" }}>Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rs-page">
        <div className="rs-tricolor" />
        <Navbar />
        <div style={{ maxWidth: "640px", margin: "2rem auto", padding: "0 1.5rem" }}>
          <p style={{ color: "var(--rs-text-muted)" }}>Client not found.</p>
          <button type="button" className="rs-btn-outline" style={{ marginTop: "1rem" }} onClick={() => navigate("/admin/dashboard")}>
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rs-page">
      <div className="rs-tricolor" />
      <Navbar />
      <div className="rs-shell-main" style={{ maxWidth: "720px", margin: "0 auto" }}>
        <button
          type="button"
          onClick={() => navigate("/admin/dashboard")}
          className="rs-btn-outline"
          style={{ marginBottom: "1.25rem", display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem" }}
        >
          <ArrowLeft size={14} /> Dashboard
        </button>

        <div className="rs-glass-strong rs-anim" style={{ borderRadius: "1.5rem", padding: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.5rem" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                border: "3px solid rgba(255,153,51,0.5)",
                overflow: "hidden",
                background: "rgba(255,153,51,0.1)",
                flexShrink: 0,
              }}
            >
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF9933", fontSize: "2rem", fontWeight: 700 }}>
                  {user.fullname?.[0]?.toUpperCase() || <User />}
                </div>
              )}
            </div>
            <div>
              <h1 style={{ margin: 0, fontFamily: "var(--rs-font)", fontSize: "1.4rem", fontWeight: 700, color: "#fff" }}>{user.fullname}</h1>
              <span className="rs-badge" style={{ marginTop: "0.4rem", display: "inline-flex" }}>Client</span>
              <p style={{ margin: "0.5rem 0 0", fontSize: "0.78rem", color: "var(--rs-text-muted)" }}>Admin view · read-only</p>
            </div>
          </div>

          <hr className="rs-divider" />

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.25rem" }}>
            {infoRows.map(({ icon: Icon, label, value }) =>
              value ? (
                <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <Icon size={18} style={{ color: "var(--rs-saffron)", marginTop: "2px", flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--rs-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
                    <p style={{ margin: "0.15rem 0 0", fontSize: "0.92rem", color: "var(--rs-text-primary)" }}>{value}</p>
                  </div>
                </div>
              ) : null
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminClientProfile;
