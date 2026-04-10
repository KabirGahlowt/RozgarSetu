import React from "react";
import TopWorkerCard from "./TopWorkerCard";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";

const LatestJobs = () => {
  const { t } = useTranslation();
  const { allWorkers } = useSelector((store) => store.work);
  const navigate = useNavigate();

  const topWorkers = [...allWorkers]
    .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
    .slice(0, 6);

  return (
    <section style={{ padding: "2rem 1.5rem 4rem", maxWidth: "1280px", margin: "0 auto" }}>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
            <Trophy size={18} style={{ color: "#FF9933" }} />
            <h2 className="rs-section-heading" style={{ margin: 0 }}>
              {t("latest.heading")} <span className="accent">{t("latest.accent")}</span>
            </h2>
          </div>
          <p style={{ color: "var(--rs-text-muted)", fontSize: "0.84rem", margin: 0 }}>
            {t("latest.sub")}
          </p>
        </div>
        <button
          onClick={() => navigate("/workers")}
          className="rs-btn-outline"
          style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", padding: "0.5rem 1.2rem" }}
        >
          {t("latest.viewAll")} <ArrowRight size={14} />
        </button>
      </div>

      {/* Grid */}
      {topWorkers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--rs-text-muted)", fontFamily: "var(--rs-font)" }}>
          {t("latest.empty")}
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
          gap: "1rem",
        }}>
          {topWorkers.map((worker) => (
            <TopWorkerCard key={worker._id} worker={worker} />
          ))}
        </div>
      )}
    </section>
  );
};

export default LatestJobs;
