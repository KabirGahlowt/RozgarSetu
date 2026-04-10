import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSearchQuery } from "../redux/workSlice";
import { useTranslation } from "react-i18next";

const categories = [
  { label: "🧹 Housekeeping", value: "Housekeeping" },
  { label: "🍳 Cook",         value: "Cook" },
  { label: "🌿 Gardener",     value: "Gardener" },
  { label: "⚡ Electrician",   value: "Electrician" },
  { label: "🔧 Mechanic",     value: "Mechanic" },
  { label: "🪠 Plumber",      value: "Plumber" },
  { label: "🏗️ Carpenter",   value: "Carpenter" },
  { label: "🚗 Driver",       value: "Driver" },
];

const CategoryCarousel = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const searchWorkerHandler = (query) => {
    dispatch(setSearchQuery(query));
    navigate("/workers");
  };

  return (
    <section style={{ padding: "3rem 1.5rem 1rem", maxWidth: "1280px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h2 className="rs-section-heading" style={{ textAlign: "center" }}>
          {t("category.heading")} <span className="accent">{t("category.accent")}</span>
        </h2>
        <p style={{ color: "var(--rs-text-muted)", fontSize: "0.86rem", marginTop: "0.3rem" }}>
          {t("category.sub")}
        </p>
      </div>

      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem",
        justifyContent: "center",
      }}>
        {categories.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => searchWorkerHandler(value)}
            className="rs-glass"
            style={{
              padding: "0.7rem 1.4rem",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,153,51,0.2)",
              color: "rgba(255,255,255,0.82)",
              fontSize: "0.88rem",
              fontFamily: "var(--rs-font)",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
              backdropFilter: "blur(12px)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,153,51,0.14)";
              e.currentTarget.style.borderColor = "#FF9933";
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(255,153,51,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              e.currentTarget.style.borderColor = "rgba(255,153,51,0.2)";
              e.currentTarget.style.color = "rgba(255,255,255,0.82)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
};

export default CategoryCarousel;
