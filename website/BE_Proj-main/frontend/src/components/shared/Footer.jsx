import React from "react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer style={{
      background: "rgba(2,8,30,0.8)",
      borderTop: "1px solid rgba(255,153,51,0.15)",
      backdropFilter: "blur(12px)",
      padding: "1.5rem 2rem",
      fontFamily: "var(--rs-font)",
    }}>
      {/* Tricolor bar */}
      <div style={{
        height: "2px",
        background: "linear-gradient(90deg,#FF9933 33.33%,#fff 33.33%,#fff 66.66%,#138808 66.66%)",
        marginBottom: "1.25rem",
        borderRadius: "1px",
      }} />

      <div style={{
        maxWidth: "1280px",
        margin: "0 auto",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "1rem",
      }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "#fff" }}>
            <span style={{ color: "#FF9933" }}>Rozgar</span>
            <span style={{ color: "#6ee87b" }}>Setu</span>
          </span>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.76rem", color: "rgba(255,255,255,0.4)" }}>
            {t("footer.copyright")}
          </p>
        </div>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {[t("footer.privacy"), t("footer.terms")].map((link) => (
            <a
              key={link}
              href="#"
              style={{
                fontSize: "0.78rem",
                color: "rgba(255,255,255,0.45)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#FF9933")}
              onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.45)")}
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
