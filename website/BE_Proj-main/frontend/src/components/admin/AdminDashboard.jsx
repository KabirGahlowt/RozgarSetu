import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import axios from "axios";
import { ADMIN_API_END_POINT } from "../../utils/constant";
import { Star, Users, UserCheck, History, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const statusColors = {
  Accepted: { bg: "rgba(19,136,8,0.15)", color: "#6ee87b", border: "rgba(19,136,8,0.3)" },
  Rejected:  { bg: "rgba(220,38,38,0.12)", color: "#f87171", border: "rgba(220,38,38,0.3)" },
  Pending:   { bg: "rgba(255,153,51,0.12)", color: "#FF9933", border: "rgba(255,153,51,0.3)" },
};

const StarRating = ({ rating, size = 13 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
    {[1,2,3,4,5].map((s) => (
      <Star key={s} size={size} style={{ color: s <= Math.round(rating||0) ? "#FF9933" : "rgba(255,255,255,0.18)", fill: s <= Math.round(rating||0) ? "#FF9933" : "transparent" }} />
    ))}
    <span style={{ fontSize: "0.7rem", color: "var(--rs-text-muted)", marginLeft: "4px" }}>({rating?.toFixed(1) || "0.0"})</span>
  </div>
);

const Panel = ({ icon: Icon, title, children }) => (
  <div className="rs-glass-strong" style={{ borderRadius: "1rem", padding: "1.5rem" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid rgba(255,153,51,0.12)" }}>
      <Icon size={16} style={{ color: "var(--rs-saffron)" }} />
      <h2 style={{ margin: 0, fontFamily: "var(--rs-font)", fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>{title}</h2>
    </div>
    {children}
  </div>
);

const Avatar = ({ src, name, size = 36 }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    border: "1.5px solid rgba(255,153,51,0.3)",
    overflow: "hidden", background: "rgba(255,153,51,0.1)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#FF9933", fontWeight: 700, fontSize: size * 0.38, flexShrink: 0,
  }}>
    {src ? <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (name?.[0]?.toUpperCase() || "?")}
  </div>
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${ADMIN_API_END_POINT}/dashboard`, { withCredentials: true })
      .then((res) => { if (res.data.success) setData(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="rs-page" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="rs-tricolor" /><Navbar />
      <p style={{ color: "var(--rs-text-muted)", fontFamily: "var(--rs-font)" }}>Loading dashboard…</p>
    </div>
  );

  return (
    <div className="rs-page">
      <div className="rs-tricolor" />
      <Navbar />
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        <h1 style={{ fontFamily: "var(--rs-font)", fontSize: "1.75rem", fontWeight: 700, color: "#fff", marginBottom: "0.25rem" }}>
          Admin <span style={{ color: "var(--rs-saffron)" }}>Dashboard</span>
        </h1>
        <p style={{ color: "var(--rs-text-muted)", fontSize: "0.84rem", marginBottom: "2rem" }}>Platform overview & analytics</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>

          {/* Recent Workers */}
          <Panel icon={Users} title="🔧 Recently Registered Workers">
            {!data?.recentWorkers?.length
              ? <p style={{ color: "var(--rs-text-muted)", fontSize: "0.84rem" }}>No workers yet.</p>
              : <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {data.recentWorkers.map((w) => (
                    <div
                      key={w._id}
                      style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}
                      onClick={() => navigate(`/description/${w._id}`)}
                    >
                      <Avatar src={w.profilePhoto} name={w.fullname} />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: 600, color: "#fff", fontFamily: "var(--rs-font)" }}>{w.fullname}</p>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--rs-text-muted)" }}>{w.skills} · {w.city}</p>
                      </div>
                      <span style={{ fontSize: "0.7rem", color: "var(--rs-text-muted)" }}>{new Date(w.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
            }
          </Panel>

          {/* Recent Clients */}
          <Panel icon={UserCheck} title="👤 Recently Registered Clients">
            {!data?.recentClients?.length
              ? <p style={{ color: "var(--rs-text-muted)", fontSize: "0.84rem" }}>No clients yet.</p>
              : <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {data.recentClients.map((c) => (
                    <div
                      key={c._id}
                      style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}
                      onClick={() => navigate(`/admin/client/${c._id}`)}
                    >
                      <Avatar src={c.profilePhoto} name={c.fullname} />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: 600, color: "#fff", fontFamily: "var(--rs-font)" }}>{c.fullname}</p>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--rs-text-muted)" }}>{c.email} · {c.phoneNumber}</p>
                      </div>
                      <span style={{ fontSize: "0.7rem", color: "var(--rs-text-muted)" }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
            }
          </Panel>

          {/* Hire History */}
          <Panel icon={History} title="📋 Recent Hire Activity">
            {!data?.hireHistory?.length
              ? <p style={{ color: "var(--rs-text-muted)", fontSize: "0.84rem" }}>No hire requests yet.</p>
              : <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {data.hireHistory.map((h) => {
                    const sc = statusColors[h.status] || statusColors.Pending;
                    return (
                      <div key={h._id} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <Avatar src={h.client?.profilePhoto} name={h.client?.fullname} />
                        <div style={{ flex: 1, fontSize: "0.84rem", color: "var(--rs-text-secondary)", fontFamily: "var(--rs-font)" }}>
                          <span style={{ fontWeight: 600, color: "#fff" }}>{h.client?.fullname}</span>
                          <span style={{ color: "var(--rs-text-muted)", margin: "0 0.35rem" }}>→</span>
                          <span style={{ fontWeight: 600, color: "#fff" }}>{h.worker?.fullname}</span>
                          <span style={{ fontSize: "0.72rem", color: "var(--rs-text-muted)", marginLeft: "0.3rem" }}>({h.worker?.skills})</span>
                        </div>
                        <span style={{ padding: "0.2rem 0.65rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 600, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                          {h.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
            }
          </Panel>

          {/* Least Rated */}
          <Panel icon={AlertTriangle} title="⚠️ Least Rated Workers">
            {!data?.leastRated?.length
              ? <p style={{ color: "var(--rs-text-muted)", fontSize: "0.84rem" }}>No rated workers yet.</p>
              : <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {data.leastRated.map((w) => (
                    <div
                      key={w._id}
                      className="rs-glass"
                      style={{ padding: "0.85rem", borderRadius: "0.75rem", cursor: "pointer" }}
                      onClick={() => navigate(`/description/${w._id}`)}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.6rem" }}>
                        <Avatar src={w.profilePhoto} name={w.fullname} />
                        <div>
                          <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: 600, color: "#fff", fontFamily: "var(--rs-font)" }}>{w.fullname}</p>
                          <StarRating rating={w.avgRating} />
                        </div>
                      </div>
                      {w.reviews?.slice(0, 2).map((r) => (
                        <div
                          key={r._id}
                          role={r.client?._id ? "button" : undefined}
                          onClick={(e) => {
                            if (!r.client?._id) return;
                            e.stopPropagation();
                            navigate(`/admin/client/${r.client._id}`);
                          }}
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            borderRadius: "0.5rem",
                            padding: "0.6rem 0.75rem",
                            marginBottom: "0.4rem",
                            fontSize: "0.78rem",
                            cursor: r.client?._id ? "pointer" : "default",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                            <Avatar src={r.client?.profilePhoto} name={r.client?.fullname} size={20} />
                            <span style={{ fontWeight: 600, color: "var(--rs-text-secondary)" }}>{r.client?.fullname}</span>
                            <StarRating rating={r.rating} size={10} />
                          </div>
                          {r.comment && <p style={{ margin: 0, color: "var(--rs-text-muted)", fontStyle: "italic" }}>"{r.comment}"</p>}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
            }
          </Panel>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
