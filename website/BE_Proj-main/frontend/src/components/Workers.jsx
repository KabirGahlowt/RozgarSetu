import React, { useEffect, useState } from "react";
import Navbar from "./shared/Navbar";
import FilterCard from "./FilterCard";
import Worker from "./Worker";
import Footer from "./shared/Footer";
import { useSelector, useDispatch } from "react-redux";
import { setSearchQuery } from "../redux/workSlice";
import { motion } from "framer-motion";
import useGetAllWorkersForBrowse from "../hooks/useGetAllWorkersForBrowse";
import { Search, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

const DEFAULT_BROWSE = { city: "", skill: "", availability: "" };

const Workers = () => {
  const { t } = useTranslation();
  const work = useSelector((store) => store.work);
  const allWorkers = work?.allWorkers ?? [];
  const searchQuery = work?.searchQuery ?? "";
  const browseFilters = work?.browseFilters ?? DEFAULT_BROWSE;
  const dispatch = useDispatch();
  useGetAllWorkersForBrowse();
  const [filterWorker, setFilterWorker] = useState(allWorkers);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  useEffect(() => {
    const q = searchQuery?.trim().toLowerCase() || "";
    const { city, skill, availability } = browseFilters ?? DEFAULT_BROWSE;

    const tokens = q ? q.split(/\s+/).filter(Boolean) : [];

    const filteredWorkers = allWorkers.filter((worker) => {
      if (!worker) return false;
      if (city) {
        const wc = (worker.city || "").toLowerCase();
        if (wc !== city.toLowerCase()) return false;
      }
      if (skill) {
        const sk = (worker.skills || "").toLowerCase();
        if (!sk.includes(skill.toLowerCase())) return false;
      }
      if (availability && worker.avaliability !== availability) return false;

      if (tokens.length) {
        const hay = [
          worker.address,
          worker.skills,
          worker.avaliability,
          worker.city,
          worker.fullname,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const matchesAll = tokens.every((t) => hay.includes(t));
        if (!matchesAll) return false;
      }
      return true;
    });
    setFilterWorker(filteredWorkers);
  }, [allWorkers, searchQuery, browseFilters]);

  return (
    <div className="rs-page">
      <div className="rs-tricolor" />
      <Navbar />

      <div className="rs-shell-main" style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Page header */}
        <div style={{ marginBottom: "1.8rem" }} className="rs-anim">
          <h1 className="rs-section-heading">
            {t("workers.title")} <span className="accent">{t("workers.titleAccent")}</span>
          </h1>
          <p style={{ color: "var(--rs-text-muted)", fontSize: "0.88rem", marginTop: "0.25rem" }}>
            {filterWorker.length} {t("workers.available", { count: filterWorker.length })}
            {(browseFilters?.city) ? ` in ${browseFilters.city}` : ""}
            {searchQuery ? ` · “${searchQuery}”` : ""}
          </p>
          {searchQuery && (
            <button
              type="button"
              className="rs-btn-outline"
              style={{ marginTop: "0.4rem", padding: "0.3rem 0.8rem", fontSize: "0.76rem" }}
              onClick={() => dispatch(setSearchQuery(""))}
            >
              {t("workers.clearSearch")}
            </button>
          )}
        </div>

        {/* Mobile filter toggle (hidden on desktop via CSS) */}
        <button
          type="button"
          className="rs-btn-outline rs-filter-toggle"
          style={{ marginBottom: "1rem", padding: "0.45rem 0.9rem", fontSize: "0.8rem", alignItems: "center", gap: "0.4rem" }}
          onClick={() => setShowFiltersMobile((v) => !v)}
        >
          <SlidersHorizontal size={14} /> {showFiltersMobile ? t("workers.hideFilters") : t("workers.showFilters")}
        </button>

        <div className="rs-layout-with-sidebar" style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
          {/* Filter sidebar */}
          <div className="rs-sidebar rs-anim rs-anim-d1" style={{ flexShrink: 0, width: "220px" }}>
            <FilterCard />
          </div>

          {/* Grid */}
          <div style={{ flex: 1 }}>
            {/* Mobile filters panel (rendered above grid when toggled) */}
            {showFiltersMobile && (
              <div className="rs-sidebar-mobile rs-anim rs-anim-d1" style={{ marginBottom: "1rem" }}>
                <FilterCard />
              </div>
            )}
            {filterWorker.length === 0 ? (
              <div className="rs-glass" style={{
                padding: "3rem", textAlign: "center", borderRadius: "1rem",
              }}>
                <Search size={40} style={{ color: "var(--rs-text-muted)", marginBottom: "1rem" }} />
                <p style={{ color: "var(--rs-text-secondary)", fontFamily: "var(--rs-font)", fontSize: "1rem", margin: 0 }}>
                  {t("workers.noWorkers")}
                </p>
                <p style={{ color: "var(--rs-text-muted)", fontSize: "0.82rem", marginTop: "0.4rem" }}>
                  {t("workers.adjustFilters")}
                </p>
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: "1rem",
                paddingBottom: "1rem",
                paddingRight: "4px",
              }}>
                {filterWorker.map((worker, i) => (
                  <motion.div
                    key={worker?._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                  >
                    <Worker worker={worker} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Workers;
