import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Phone, Eye, MessageSquare, CheckCircle, XCircle, Clock } from "lucide-react";
import ReviewDialog from "./ReviewDialog";
import { useNavigate } from "react-router-dom";

const statusConfig = {
  Accepted: { color: "#6ee87b",  bg: "rgba(19,136,8,0.14)",   border: "rgba(19,136,8,0.3)",   icon: CheckCircle },
  Rejected: { color: "#f87171",  bg: "rgba(220,38,38,0.12)",  border: "rgba(220,38,38,0.3)",  icon: XCircle },
  Pending:  { color: "#FF9933",  bg: "rgba(255,153,51,0.12)", border: "rgba(255,153,51,0.3)", icon: Clock },
  Done:     { color: "#60a5fa",  bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.3)", icon: CheckCircle },
};

const th = {
  padding: "0.65rem 0.85rem",
  textAlign: "left",
  fontSize: "0.7rem",
  fontWeight: 600,
  color: "rgba(255,255,255,0.82)",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  fontFamily: "var(--rs-font)",
  borderBottom: "1px solid rgba(255,153,51,0.22)",
  background: "rgba(255,153,51,0.1)",
};

const td = {
  padding: "0.85rem",
  borderBottom: "1px solid rgba(255,255,255,0.05)",
  fontFamily: "var(--rs-font)",
  fontSize: "0.84rem",
  color: "var(--rs-text-secondary)",
  verticalAlign: "middle",
};

const HiredWorkerTable = () => {
  const { clientHires } = useSelector((store) => store.application);
  const [open, setOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const navigate = useNavigate();

  const handleOpenReview = (workerId) => { setSelectedWorkerId(workerId); setOpen(true); };
  const handleClose = () => { setOpen(false); setSelectedWorkerId(null); };

  if (!clientHires.length) {
    return (
      <div className="rs-glass" style={{ padding: "2rem", textAlign: "center", borderRadius: "0.75rem" }}>
        <p style={{ color: "var(--rs-text-muted)", fontFamily: "var(--rs-font)", fontSize: "0.88rem" }}>No hired workers yet.</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["Date", "Worker", "Skill", "Contact", "Status", "Action"].map((h) => (
              <th key={h} style={th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {clientHires.map((item) => {
            const sc = statusConfig[item?.status] || statusConfig.Pending;
            const StatusIcon = sc.icon;
            return (
              <tr key={item._id} style={{ transition: "background 0.15s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,153,51,0.04)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <td style={td}>{item?.createdAt?.split("T")[0]}</td>
                <td style={td}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1.5px solid rgba(255,153,51,0.3)", overflow: "hidden", background: "rgba(255,153,51,0.1)", flexShrink: 0 }}>
                      {item?.worker?.profilePhoto
                        ? <img src={item.worker.profilePhoto} alt={item.worker.fullname} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF9933", fontWeight: 700, fontSize: "0.85rem" }}>{item?.worker?.fullname?.[0]}</div>
                      }
                    </div>
                    <span style={{ color: "#fff", fontWeight: 500 }}>{item?.worker?.fullname}</span>
                  </div>
                </td>
                <td style={td}>{item?.worker?.skills}</td>
                <td style={td}>
                  {item?.status === "Accepted" ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#6ee87b", fontWeight: 500 }}>
                      <Phone size={13} /> {item?.worker?.phoneNumber}
                    </div>
                  ) : (
                    <span style={{ color: "var(--rs-text-muted)", fontStyle: "italic" }}>Hidden</span>
                  )}
                </td>
                <td style={td}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.25rem 0.7rem", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 600, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                    <StatusIcon size={11} /> {item?.status}
                  </span>
                </td>
                <td style={td}>
                  <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-start", flexWrap: "wrap" }}>
                    <button onClick={() => navigate(`/description/${item?.worker?._id}`)} className="rs-btn-outline" style={{ padding: "0.3rem 0.75rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <Eye size={12} /> View
                    </button>
                    {item?.status === "Accepted" && (
                      <button onClick={() => item?.worker?._id && handleOpenReview(item?.worker?._id)} className="rs-btn-primary" style={{ padding: "0.3rem 0.75rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.3rem", marginRight: "0.1rem" }}>
                        <MessageSquare size={12} /> Review
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        <caption style={{ captionSide: "bottom", textAlign: "center", fontSize: "0.72rem", color: "var(--rs-text-muted)", fontFamily: "var(--rs-font)", padding: "0.75rem" }}>
          A list of all workers you have hired
        </caption>
      </table>
      <ReviewDialog open={open} setOpen={handleClose} workerId={selectedWorkerId} />
    </div>
  );
};

export default HiredWorkerTable;
