import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBrowseFilters, clearBrowseFilters, setSearchQuery } from "../redux/workSlice";
import { Link } from "react-router-dom";
import { SlidersHorizontal, X, Sparkles, MapPin } from "lucide-react";

const CITIES = [
  "Pune",
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Nagpur",
  "Jaipur",
];

const SKILLS = ["Cook", "Housekeeping", "Gardener", "Electrician", "Mechanic"];
const AVAIL = ["Full-time", "Part-time", "On-demand"];

const DEFAULT_BROWSE = { city: "", skill: "", availability: "" };

const FilterCard = () => {
  const dispatch = useDispatch();
  const browseFilters = useSelector((store) => store.work?.browseFilters) ?? DEFAULT_BROWSE;
  const { city, skill, availability } = browseFilters;

  const toggle = (key, value) => {
    const current = browseFilters[key];
    dispatch(setBrowseFilters({ [key]: current === value ? "" : value }));
    // When using explicit filters, clear any free-text search from the homepage
    dispatch(setSearchQuery(""));
  };

  const hasAny = city || skill || availability;

  const FilterGroup = ({ title, hint, children }) => (
    <div style={{ marginBottom: "1.1rem" }}>
      <p
        style={{
          margin: "0 0 0.35rem",
          fontSize: "0.72rem",
          fontWeight: 600,
          color: "var(--rs-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {title}
      </p>
      {hint && (
        <p style={{ margin: "0 0 0.55rem", fontSize: "0.68rem", color: "rgba(255,255,255,0.38)", lineHeight: 1.45 }}>
          {hint}
        </p>
      )}
      {children}
    </div>
  );

  const PillButton = ({ selected, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.45rem 0.75rem",
        borderRadius: "0.5rem",
        border: selected ? "1px solid rgba(255,153,51,0.5)" : "1px solid rgba(255,255,255,0.07)",
        background: selected ? "rgba(255,153,51,0.12)" : "rgba(255,255,255,0.03)",
        color: selected ? "#FF9933" : "rgba(255,255,255,0.7)",
        fontSize: "0.82rem",
        fontFamily: "var(--rs-font)",
        cursor: "pointer",
        transition: "all 0.15s ease",
        textAlign: "left",
        width: "100%",
      }}
    >
      <span
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          flexShrink: 0,
          border: `2px solid ${selected ? "#FF9933" : "rgba(255,255,255,0.3)"}`,
          background: selected ? "#FF9933" : "transparent",
          transition: "all 0.15s",
        }}
      />
      {children}
    </button>
  );

  return (
    <div className="rs-glass-strong" style={{ padding: "1.25rem", borderRadius: "1rem", minWidth: "210px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <SlidersHorizontal size={15} style={{ color: "var(--rs-saffron)" }} />
          <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#fff", fontFamily: "var(--rs-font)" }}>Filters</span>
        </div>
        {hasAny && (
          <button
            type="button"
            onClick={() => {
              dispatch(clearBrowseFilters());
              dispatch(setSearchQuery(""));
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--rs-text-muted)",
              padding: "2px",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              fontSize: "0.72rem",
            }}
          >
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      <FilterGroup
        title="City"
        hint="Choose a city to see workers registered there. For a street, society, or landmark, use the AI Assistant."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          {CITIES.map((c) => (
            <PillButton key={c} selected={city === c} onClick={() => toggle("city", c)}>
              <MapPin size={12} style={{ opacity: 0.7, flexShrink: 0 }} />
              {c}
            </PillButton>
          ))}
        </div>
        <Link
          to="/assistant"
          style={{
            marginTop: "0.75rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.5rem",
            padding: "0.65rem 0.75rem",
            borderRadius: "0.65rem",
            background: "rgba(19,136,8,0.08)",
            border: "1px solid rgba(19,136,8,0.22)",
            textDecoration: "none",
            color: "rgba(255,255,255,0.88)",
            fontSize: "0.72rem",
            lineHeight: 1.45,
            fontFamily: "var(--rs-font)",
            transition: "background 0.2s",
          }}
        >
          <Sparkles size={14} style={{ color: "#6ee87b", flexShrink: 0, marginTop: "2px" }} />
          <span>
            <strong style={{ color: "#6ee87b" }}>Need a more specific area?</strong> Open the{" "}
            <span style={{ color: "#FF9933", fontWeight: 600 }}>AI Assistant</span> — it matches workers to exact locations on the map.
          </span>
        </Link>
      </FilterGroup>

      <hr className="rs-divider" style={{ margin: "0.8rem 0" }} />

      <FilterGroup title="Skill">
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          {SKILLS.map((item) => (
            <PillButton key={item} selected={skill === item} onClick={() => toggle("skill", item)}>
              {item}
            </PillButton>
          ))}
        </div>
      </FilterGroup>

      <hr className="rs-divider" style={{ margin: "0.8rem 0" }} />

      <FilterGroup title="Availability">
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          {AVAIL.map((item) => (
            <PillButton key={item} selected={availability === item} onClick={() => toggle("availability", item)}>
              {item}
            </PillButton>
          ))}
        </div>
      </FilterGroup>
    </div>
  );
};

export default FilterCard;
