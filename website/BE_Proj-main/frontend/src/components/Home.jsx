import React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "./shared/Navbar";
import HeroSection from "./HeroSection";
import CategoryCarousel from "./CategoryCarousel";
import LatestJobs from "./LatestJobs";
import Footer from "./shared/Footer";
import useGetAllWorkers from "../hooks/useGetAllWorkers";

const Home = () => {
  const { t, i18n } = useTranslation();
  const [showLangPopup, setShowLangPopup] = useState(
    !localStorage.getItem("rs_lang_prompted")
  );
  const languageOptions = ["en", "hi", "mr", "ta", "te", "kn"];
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || "en");
  const languageLabelMap = {
    en: t("language.englishFull"),
    hi: t("language.hindiFull"),
    mr: t("language.marathiFull"),
    ta: t("language.tamilFull"),
    te: t("language.teluguFull"),
    kn: t("language.kannadaFull"),
  };
  useGetAllWorkers();

  const pickLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("rs_lang_prompted", "1");
    setShowLangPopup(false);
  };

  return (
    <div style={{ background: "var(--rs-navy)", minHeight: "100vh" }}>
      {showLangPopup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              width: "min(420px, 96vw)",
              borderRadius: "1rem",
              border: "1px solid rgba(255,153,51,0.35)",
              background: "rgba(2,8,30,0.95)",
              backdropFilter: "blur(18px)",
              color: "#fff",
              padding: "1.2rem",
              boxShadow: "0 16px 50px rgba(0,0,0,0.45)",
              textAlign: "center",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
              {t("language.popupTitle")}
            </h3>
            <p style={{ margin: "0.5rem 0 1rem", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
              {t("language.popupSubtitle")}
            </p>
            <div style={{ display: "flex", gap: "0.7rem", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                style={{
                  minWidth: "220px",
                  padding: "0.58rem 0.8rem",
                  borderRadius: "999px",
                  border: "1px solid rgba(255,153,51,0.35)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                }}
              >
                {languageOptions.map((lng) => (
                  <option key={lng} value={lng} style={{ background: "#02081e", color: "#fff" }}>
                    {languageLabelMap[lng]}
                  </option>
                ))}
              </select>
              <button
                onClick={() => pickLanguage(selectedLanguage)}
                style={{
                  padding: "0.6rem 1rem",
                  borderRadius: "999px",
                  border: "none",
                  background: "linear-gradient(135deg,#FF9933,#e8650a)",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Fixed navbar overlays everything — must be mounted to render */}
      <Navbar />
      <HeroSection />

      {/* Below-the-fold sections get the dark gradient bg */}
      <div style={{
        background:
          "radial-gradient(ellipse at 80% 0%, rgba(255,153,51,0.06) 0%, transparent 50%)," +
          "radial-gradient(ellipse at 0% 80%, rgba(19,136,8,0.05) 0%, transparent 50%)," +
          "linear-gradient(180deg,#04061a 0%,#020510 60%,#010208 100%)",
      }}>
        <CategoryCarousel />
        <LatestJobs />
        <Footer />
      </div>
    </div>
  );
};

export default Home;
