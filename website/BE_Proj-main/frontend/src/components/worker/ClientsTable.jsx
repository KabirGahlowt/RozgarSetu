import React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { APPLICATION_API_END_POINT } from "../../utils/constant";
import { toast } from "sonner";
import { setAllApplicants } from "../../redux/applicationSlice";
import { Phone } from "lucide-react";

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
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  fontFamily: "var(--rs-font)",
  fontSize: "0.84rem",
  color: "var(--rs-text-secondary)",
  verticalAlign: "middle",
};

const ClientsTable = () => {
  const { t } = useTranslation();
  const { applicants } = useSelector((store) => store.application);
  const dispatch = useDispatch();

  const statusLabel = (status) => {
    const key =
      {
        Pending: "workerProfile.statusPending",
        Accepted: "workerProfile.statusAccepted",
        Rejected: "workerProfile.statusRejected",
        Completed: "workerProfile.statusCompleted",
      }[status];
    return key ? t(key) : status;
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await axios.post(
        `${APPLICATION_API_END_POINT}/hire/status/${id}`,
        { status },
        { withCredentials: true },
      );
      if (res.data.success) {
        toast.success(res.data.message);
        dispatch(
          setAllApplicants(
            applicants.map((application) =>
              application._id === id ? { ...application, status } : application,
            ),
          ),
        );
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
    }
  };

  if (!applicants?.length) {
    return (
      <div className="rs-glass" style={{ padding: "2rem", textAlign: "center", borderRadius: "0.75rem" }}>
        <p style={{ color: "var(--rs-text-muted)", fontFamily: "var(--rs-font)", fontSize: "0.88rem", margin: 0 }}>
          {t("workerProfile.noHireRequestsYet")}
        </p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["colPhoto", "colName", "colRequestDate", "colContact", "colActions", "colStatus"].map((col) => (
              <th key={col} style={th}>
                {t(`workerProfile.${col}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {applicants.map((application) => (
            <tr
              key={application._id}
              style={{ transition: "background 0.15s" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,153,51,0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <td style={td}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2px solid rgba(255,153,51,0.35)",
                    background: "rgba(255,153,51,0.1)",
                  }}
                >
                  {application?.client?.profilePhoto ? (
                    <img src={application.client.profilePhoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FF9933",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                      }}
                    >
                      {application?.client?.fullname?.[0] || "?"}
                    </div>
                  )}
                </div>
              </td>
              <td style={{ ...td, color: "#fff", fontWeight: 500 }}>{application?.client?.fullname}</td>
              <td style={td}>{application?.createdAt?.split("T")[0]}</td>
              <td style={td}>
                {application?.status === "Accepted" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "#6ee87b", fontWeight: 500 }}>
                    <Phone size={13} /> {application?.client?.phoneNumber}
                  </div>
                ) : (
                  <span style={{ color: "var(--rs-text-muted)", fontStyle: "italic" }}>{t("workerProfile.hiddenUntilAccepted")}</span>
                )}
              </td>
              <td style={td}>
                {application?.status === "Pending" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                    <button type="button" className="rs-btn-primary" style={{ padding: "0.35rem 0.85rem", fontSize: "0.75rem" }} onClick={() => handleStatusUpdate(application._id, "Accepted")}>
                      {t("workerRequests.accept")}
                    </button>
                    <button type="button" className="rs-btn-outline" style={{ padding: "0.35rem 0.85rem", fontSize: "0.75rem" }} onClick={() => handleStatusUpdate(application._id, "Rejected")}>
                      {t("workerRequests.reject")}
                    </button>
                  </div>
                ) : application?.status === "Accepted" ? (
                  <button type="button" className="rs-btn-outline" style={{ padding: "0.35rem 0.85rem", fontSize: "0.75rem" }} onClick={() => handleStatusUpdate(application._id, "Completed")}>
                    {t("workerRequests.markJobDone")}
                  </button>
                ) : (
                  <span style={{ color: "var(--rs-text-muted)", fontSize: "0.8rem" }}>{t("profile.none")}</span>
                )}
              </td>
              <td style={td}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "0.25rem 0.65rem",
                    borderRadius: "999px",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    background:
                      application?.status === "Accepted"
                        ? "rgba(19,136,8,0.14)"
                        : application?.status === "Rejected"
                          ? "rgba(220,38,38,0.12)"
                          : "rgba(255,255,255,0.06)",
                    color:
                      application?.status === "Accepted"
                        ? "#6ee87b"
                        : application?.status === "Rejected"
                          ? "#f87171"
                          : "var(--rs-text-muted)",
                    border: `1px solid ${
                      application?.status === "Accepted"
                        ? "rgba(19,136,8,0.35)"
                        : application?.status === "Rejected"
                          ? "rgba(220,38,38,0.3)"
                          : "rgba(255,255,255,0.12)"
                    }`,
                  }}
                >
                  {statusLabel(application?.status)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        <caption
          style={{
            captionSide: "bottom",
            textAlign: "center",
            fontSize: "0.72rem",
            color: "var(--rs-text-muted)",
            fontFamily: "var(--rs-font)",
            padding: "0.75rem",
          }}
        >
          {t("workerProfile.hireRequestsCaption")}
        </caption>
      </table>
    </div>
  );
};

export default ClientsTable;
