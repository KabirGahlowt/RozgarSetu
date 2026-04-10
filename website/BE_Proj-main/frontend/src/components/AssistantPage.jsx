import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Popup, Marker, useMap } from "react-leaflet";
import L, { LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";
import { RS_BOT_API_END_POINT } from "../utils/constant";
import "../styles/rojarAssistant.css";
import {
  ArrowLeft,
  Bot,
  User,
  Loader2,
  Send,
  MapPin,
  Briefcase,
  Star,
  Phone,
  Search,
} from "lucide-react";

const DEFAULT_MAP_CENTER = [18.5912, 73.7015]; // Hinjewadi area
const DEFAULT_ZOOM = 12;

/** API may send strings; Leaflet needs finite numbers. Accept legacy `lon`. */
function normalizeMapFeatures(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((f) => {
      const lat = Number(f?.lat ?? f?.latitude);
      const lng = Number(f?.lng ?? f?.lon ?? f?.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      const isWorker = String(f?.type ?? "").toLowerCase() === "worker";
      return {
        ...f,
        lat,
        lng,
        type: isWorker ? "worker" : "target",
        label: f?.label ?? (isWorker ? "Worker" : "Search"),
      };
    })
    .filter(Boolean);
}

/** Closer workers first; more experience breaks ties (matches server ranking). */
function sortMatchesDistanceFirst(matches) {
  if (!Array.isArray(matches)) return [];
  return [...matches].sort((a, b) => {
    const da = Number(a.distance_km);
    const db = Number(b.distance_km);
    const aOk = Number.isFinite(da);
    const bOk = Number.isFinite(db);
    if (aOk && bOk && da !== db) return da - db;
    if (aOk && !bOk) return -1;
    if (!aOk && bOk) return 1;
    const ea = Number(a.experience_years) || 0;
    const eb = Number(b.experience_years) || 0;
    return eb - ea;
  });
}

/**
 * Combine API map_features with per-worker lat/lng on matches (recommender),
 * and ensure a target pin from target_coords if missing.
 */
function buildMapFeaturesFromBotPayload(data, overrideTargetCoords) {
  const feats = normalizeMapFeatures(data?.map_features);
  const seenW = new Set(
    feats.filter((f) => f.type === "worker" && f.worker_id != null).map((f) => String(f.worker_id))
  );

  for (const m of data?.matches ?? []) {
    const wid = m.worker_id != null ? String(m.worker_id) : null;
    if (wid && seenW.has(wid)) continue;
    const lat = Number(m.lat ?? m.latitude);
    const lng = Number(m.lng ?? m.lon ?? m.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    feats.push({
      type: "worker",
      lat,
      lng,
      worker_id: m.worker_id,
      label: `${m.name ?? "Worker"} (${m.phone ?? ""})`,
    });
    if (wid) seenW.add(wid);
  }

  // If caller provided override coords from Place Details API, use those directly
  const hasTarget = feats.some((f) => f.type === "target");
  if (!hasTarget) {
    const tc = overrideTargetCoords ?? data?.target_coords;
    const parsed = data?.parsed ?? {};
    if (Array.isArray(tc) && tc.length >= 2) {
      const lat = Number(tc[0]);
      const lng = Number(tc[1]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        feats.unshift({
          type: "target",
          lat,
          lng,
          label: `YOU ARE HERE (${parsed.address || parsed.location || "Search"})`,
        });
      }
    }
  }

  return feats;
}

const SUGGESTIONS = [
  "Find cooks near Hinjewadi",
  "Maid near Baner",
  "Part-time driver Wakad",
  "Plumber in Kothrud",
  "Babysitter near Aundh",
  "Cook near Pimple Saudagar",
];

const WELCOME_MSG = {
  id: 0,
  role: "bot",
  type: "text",
  text: "👋 Hi! I'm the RozgarSetu AI assistant. Tell me what kind of worker you need and where — I'll find the best matches near you!\n\nTry: \"Find a cook near Melange Residences, Hinjewadi\"\n\nThe map uses the same logic as the RS Bot app: 🎯 red = your search location, blue = each recommended worker (geocoded from their address).",
};

function InitialsAvatar({ name }) {
  const initials = (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return <div className="rs-worker-photo">{initials}</div>;
}

function WorkerCard({ match, index, onSelect }) {
  const [photoOk, setPhotoOk] = useState(!!match.profile_photo);
  return (
    <div
      className="rs-worker-card"
      onClick={() => onSelect && onSelect(match)}
      style={{ cursor: "pointer" }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSelect?.(match);
      }}
    >
      <div className="rs-worker-card-header">
        {match.profile_photo && photoOk ? (
          <img
            src={match.profile_photo}
            alt={match.name}
            className="rs-worker-photo"
            onError={() => setPhotoOk(false)}
          />
        ) : (
          <InitialsAvatar name={match.name} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="rs-worker-name">
            {index}. {match.name}
          </div>
        </div>
      </div>
      <div className="rs-worker-meta">
        {match.distance && match.distance !== "Unknown" && (
          <span className="rs-worker-meta-item">
            <MapPin size={11} />
            {match.distance} away
          </span>
        )}
        {match.experience_years !== undefined && (
          <span className="rs-worker-meta-item">
            <Briefcase size={11} />
            {match.experience_years} yrs exp
          </span>
        )}
        {match.rating && (
          <span className="rs-worker-meta-item">
            <Star size={11} />
            {match.rating}/5
          </span>
        )}
        {match.phone && (
          <span className="rs-worker-meta-item">
            <Phone size={11} />
            {match.phone}
          </span>
        )}
      </div>
      {match.skills && match.skills.length > 0 && (
        <div className="rs-worker-skills">
          {match.skills.map((s) => (
            <span key={s} className="rs-skill-tag">
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Message({ msg, onSelect }) {
  const isBot = msg.role === "bot";
  if (msg.type === "workers" && msg.matches) {
    return (
      <div className="rs-msg-row">
        <div className="rs-msg-avatar bot">
          <Bot size={14} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="rs-msg-bubble bot" style={{ maxWidth: "100%" }}>
            {msg.text}
          </div>
          {sortMatchesDistanceFirst(msg.matches).map((m, i) => (
            <WorkerCard key={m.worker_id} match={m} index={i + 1} onSelect={onSelect} />
          ))}
        </div>
      </div>
    );
  }
  if (msg.type === "error") {
    return (
      <div className="rs-msg-row">
        <div className="rs-msg-avatar bot">
          <Bot size={14} />
        </div>
        <div className="rs-error-bubble">{msg.text}</div>
      </div>
    );
  }
  return (
    <div className={`rs-msg-row ${isBot ? "bot" : "user"}`}>
      <div className={`rs-msg-avatar ${isBot ? "bot" : "user"}`}>
        {isBot ? <Bot size={14} /> : <User size={14} />}
      </div>
      <div className={`rs-msg-bubble ${isBot ? "bot" : "user"}`}>{msg.text}</div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="rs-msg-row">
      <div className="rs-msg-avatar bot">
        <Bot size={14} />
      </div>
      <div className="rs-msg-bubble bot">
        <div className="rs-typing-dots">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

/** Fit map to all pins — mirrors Streamlit pydeck centering on target + workers. */
function MapFitBounds({ features, defaultCenter, defaultZoom }) {
  const map = useMap();
  useEffect(() => {
    const pts = (features || []).filter(
      (f) => Number.isFinite(f.lat) && Number.isFinite(f.lng)
    );
    if (!pts.length) {
      map.setView(defaultCenter, defaultZoom);
      return;
    }
    if (pts.length === 1) {
      map.setView([pts[0].lat, pts[0].lng], 14);
      return;
    }
    const b = new LatLngBounds(pts.map((f) => [f.lat, f.lng]));
    map.fitBounds(b, { padding: [48, 48], maxZoom: 15 });
  }, [features, map, defaultCenter, defaultZoom]);
  return null;
}

/** Leaflet often measures 0×0 under flex/React StrictMode until invalidateSize runs. */
function MapResizeFix({ revision }) {
  const map = useMap();
  useEffect(() => {
    const fix = () => {
      map.invalidateSize({ animate: false });
    };
    fix();
    const a = requestAnimationFrame(fix);
    const t1 = setTimeout(fix, 50);
    const t2 = setTimeout(fix, 250);
    window.addEventListener("resize", fix);
    return () => {
      cancelAnimationFrame(a);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", fix);
    };
  }, [map, revision]);
  return null;
}

// ─── Address Autocomplete Hook ─────────────────────────────────────────────────
/**
 * Detects if the user has typed "near <something>" or "at <something>" in the
 * input and returns the fragment after the trigger word for use as autocomplete input.
 * Returns null if no near/at trigger is found or the fragment is too short.
 */
function extractNearFragment(text) {
  // Match patterns like "find cooks near ", "maid near el", "near elastic"
  const match = text.match(/(?:near|at|close to|around|opposite|next to)\s+(.*)$/i);
  if (!match) return null;
  const fragment = match[1].trim();
  return fragment.length >= 2 ? fragment : null;
}

/**
 * Autocomplete dropdown for address suggestions.
 * Shown when typing after "near/at/close to" keywords.
 */
function AddressAutocomplete({ fragment, onSelect, onClose }) {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!fragment || fragment.length < 2) {
      setPredictions([]);
      return;
    }
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${RS_BOT_API_END_POINT}/api/places-autocomplete`,
          { params: { input: fragment }, timeout: 6000 }
        );
        setPredictions(res.data?.predictions ?? []);
        setActiveIdx(-1);
      } catch {
        // If API key not set or offline, silently hide dropdown
        setPredictions([]);
      } finally {
        setLoading(false);
      }
    }, 280);
    return () => clearTimeout(debounceRef.current);
  }, [fragment]);

  const handleKeyDown = useCallback(
    (e) => {
      if (!predictions.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, predictions.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, -1));
      } else if (e.key === "Enter" && activeIdx >= 0) {
        e.preventDefault();
        onSelect(predictions[activeIdx]);
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [predictions, activeIdx, onSelect, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!predictions.length && !loading) return null;

  return (
    <div className="rs-autocomplete-dropdown">
      <div className="rs-autocomplete-header">
        <Search size={11} />
        <span>Select address from Google Maps</span>
      </div>
      {loading && (
        <div className="rs-autocomplete-loading">
          <Loader2 size={13} className="rs-spin" />
          <span>Searching…</span>
        </div>
      )}
      {predictions.map((p, i) => (
        <div
          key={p.place_id}
          className={`rs-autocomplete-item${activeIdx === i ? " active" : ""}`}
          onMouseDown={(e) => {
            e.preventDefault(); // prevent textarea blur before click
            onSelect(p);
          }}
          onMouseEnter={() => setActiveIdx(i)}
        >
          <MapPin size={12} className="rs-autocomplete-pin" />
          <div className="rs-autocomplete-texts">
            <span className="rs-autocomplete-main">{p.main_text}</span>
            {p.secondary_text && (
              <span className="rs-autocomplete-secondary">{p.secondary_text}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AssistantPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [botOnline, setBotOnline] = useState(null);
  /** Same schema as RS-bot API map_features: { type: 'target'|'worker', lat, lng, label, worker_id? } */
  const [mapFeatures, setMapFeatures] = useState([]);
  /** Defer creating Leaflet map until after mount — avoids broken map under React StrictMode (dev). */
  const [mapReady, setMapReady] = useState(false);
  useEffect(() => {
    setMapReady(true);
  }, []);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Autocomplete state
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null); // { lat, lng, description }
  const nearFragment = showAutocomplete ? extractNearFragment(input) : null;

  useEffect(() => {
    axios
      .get(`${RS_BOT_API_END_POINT}/`, { timeout: 3000 })
      .then(() => setBotOnline(true))
      .catch(() => setBotOnline(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Show autocomplete when the user has typed something after "near"
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    setSelectedPlace(null); // clear saved place when user edits
    const fragment = extractNearFragment(val);
    setShowAutocomplete(!!fragment);
  };

  const handlePlaceSelect = async (prediction) => {
    setShowAutocomplete(false);
    // Replace the part after "near " with the selected description
    const triggerMatch = input.match(/^(.*(?:near|at|close to|around|opposite|next to)\s+)/i);
    const prefix = triggerMatch ? triggerMatch[1] : input.replace(/\s*$/, " near ");
    const newInput = prefix + prediction.description;
    setInput(newInput);

    // Resolve lat/lng from place_id so we can inject it directly
    try {
      const res = await axios.get(
        `${RS_BOT_API_END_POINT}/api/geocode-place`,
        { params: { place_id: prediction.place_id }, timeout: 6000 }
      );
      setSelectedPlace({
        lat: res.data.lat,
        lng: res.data.lng,
        description: prediction.description,
        name: res.data.name,
        formatted_address: res.data.formatted_address,
      });
    } catch {
      // If geocode-place fails, proceed without override coords
    }

    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSelectWorker = (worker) => {
    navigate(`/description/${worker.worker_id}`);
  };

  const sendMessage = async (text) => {
    const query = (text || input).trim();
    if (!query || loading) return;

    setInput("");
    setShowAutocomplete(false);
    const capturedPlace = selectedPlace; // capture before clearing
    setSelectedPlace(null);

    const userMsg = { id: Date.now(), role: "user", type: "text", text: query };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      /* Use /api/bot so worker search + map_features always run. */
      const res = await axios.post(`${RS_BOT_API_END_POINT}/api/bot`, { query }, { timeout: 45000 });

      const data = res.data;

      // If the user selected from Google Maps autocomplete, we have precise coords.
      // Inject them directly so the red pin always shows even if Nominatim fails.
      let overrideCoords = null;
      if (capturedPlace?.lat && capturedPlace?.lng) {
        overrideCoords = [capturedPlace.lat, capturedPlace.lng];
        // Also patch the parsed.address label
        if (data.parsed) {
          data.parsed.address = data.parsed.address || capturedPlace.name || capturedPlace.description;
        }
      }

      setMapFeatures(buildMapFeaturesFromBotPayload(data, overrideCoords));
      const workerMatches = sortMatchesDistanceFirst(data.matches);

      if (workerMatches.length > 0) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "bot",
            type: "workers",
            text:
              (data.response && String(data.response).trim()) ||
              `✅ Found **${workerMatches.length}** worker${
                workerMatches.length > 1 ? "s" : ""
              } matching your request:`,
            matches: workerMatches,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "bot",
            type: "text",
            text:
              (data.response && String(data.response).trim()) ||
              'Sorry, no workers found. Try a different location or skill — e.g., "cook near Hinjewadi".',
          },
        ]);
      }
    } catch (err) {
      const isOffline =
        !err.response || err.code === "ECONNABORTED" || err.code === "ERR_NETWORK";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "bot",
          type: "error",
          text: isOffline
            ? "⚠️ RS Bot offline. Start: cd RS-bot && python -m uvicorn api.main:app --host 0.0.0.0 --port 8001 (use .env VITE_RS_BOT_URL on phone)"
            : `Error: ${err.response?.data?.detail || err.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="rs-assistant-root">
      <header className="rs-assistant-topbar">
        <button
          type="button"
          className="rs-assistant-back"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="rs-assistant-topbar-title">RozgarSetu AI Assistant</div>
          <div className="rs-assistant-topbar-sub">
            {botOnline === null
              ? "Connecting to bot…"
              : botOnline
                ? "Online"
                : "Bot offline — start the FastAPI server on port 8001"}
          </div>
        </div>
      </header>

      <div className="rs-assistant-grid">
        <div className="rs-assistant-chat-col">
          <div className="rs-bot-messages">
            {messages.map((msg) => (
              <Message key={msg.id} msg={msg} onSelect={handleSelectWorker} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="rs-suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" className="rs-suggestion-chip" onClick={() => sendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="rs-bot-input-area" style={{ position: "relative" }}>
            {/* Address autocomplete dropdown */}
            {showAutocomplete && nearFragment && (
              <AddressAutocomplete
                fragment={nearFragment}
                onSelect={handlePlaceSelect}
                onClose={() => setShowAutocomplete(false)}
              />
            )}

            {/* Selected place badge */}
            {selectedPlace && (
              <div className="rs-place-badge">
                <MapPin size={11} />
                <span>{selectedPlace.name || selectedPlace.description}</span>
                <button
                  type="button"
                  className="rs-place-badge-clear"
                  onClick={() => setSelectedPlace(null)}
                  aria-label="Clear selected place"
                >
                  ×
                </button>
              </div>
            )}

            <div className="rs-bot-input-row">
              <textarea
                ref={inputRef}
                id="rs-chat-input"
                className="rs-bot-input"
                placeholder='Type "find cooks near " to get address suggestions…'
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  const fragment = extractNearFragment(input);
                  if (fragment) setShowAutocomplete(true);
                }}
                onBlur={() => {
                  setTimeout(() => setShowAutocomplete(false), 180);
                }}
                rows={1}
                disabled={loading}
                autoComplete="off"
              />
              <button
                type="button"
                id="rs-send-btn"
                className="rs-bot-send-btn"
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
              >
                {loading ? (
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          </div>
          <div className="rs-bot-footer">Powered by RozgarSetu · Map data © OpenStreetMap</div>
        </div>

        <div className="rs-assistant-map-col">
          <div className="rs-assistant-map-wrap">
            {!mapReady ? (
              <div
                style={{
                  height: "100%",
                  minHeight: 280,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#666",
                  fontSize: 14,
                }}
              >
                Loading map…
              </div>
            ) : (
              <MapContainer
              center={DEFAULT_MAP_CENTER}
              zoom={DEFAULT_ZOOM}
              style={{ height: "100%", width: "100%", minHeight: 280 }}
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapResizeFix
                revision={mapFeatures.map((f) => `${f.type}:${f.lat}:${f.lng}`).join("|")}
              />
              <MapFitBounds
                features={mapFeatures}
                defaultCenter={DEFAULT_MAP_CENTER}
                defaultZoom={DEFAULT_ZOOM}
              />
              {mapFeatures.map((f, idx) => {
                const isTarget = f.type === "target";
                // Short display name: "You" for target, first name for workers
                const displayName = isTarget
                  ? "You"
                  : (f.label || "").split(" ")[0] || "Worker";
                const pinColor = isTarget ? "#ff4b4b" : "#0064ff";
                const shadowColor = isTarget
                  ? "rgba(255,75,75,0.35)"
                  : "rgba(0,100,255,0.28)";

                const icon = L.divIcon({
                  className: "",
                  html: `
                    <div style="
                      display:flex;
                      flex-direction:column;
                      align-items:center;
                      gap:2px;
                      user-select:none;
                    ">
                      <!-- Pin SVG -->
                      <svg width="${isTarget ? 36 : 28}" height="${isTarget ? 44 : 34}"
                           viewBox="0 0 36 44" fill="none"
                           xmlns="http://www.w3.org/2000/svg">
                        <ellipse cx="18" cy="42" rx="7" ry="2.5"
                          fill="${shadowColor}"/>
                        <path d="M18 2C10.268 2 4 8.268 4 16c0 10 14 26 14 26S32 26 32 16C32 8.268 25.732 2 18 2Z"
                          fill="${pinColor}" stroke="white" stroke-width="2"/>
                        <circle cx="18" cy="16" r="6" fill="white" fill-opacity="0.9"/>
                      </svg>
                      <!-- Name label -->
                      <span style="
                        background:${pinColor};
                        color:white;
                        font-size:${isTarget ? 11 : 10}px;
                        font-weight:700;
                        font-family:'Inter',sans-serif;
                        padding:2px 7px;
                        border-radius:20px;
                        white-space:nowrap;
                        box-shadow:0 2px 6px ${shadowColor};
                        letter-spacing:0.2px;
                        max-width:90px;
                        overflow:hidden;
                        text-overflow:ellipsis;
                        display:block;
                        text-align:center;
                      ">${displayName}</span>
                    </div>`,
                  iconSize: [isTarget ? 90 : 80, isTarget ? 70 : 58],
                  iconAnchor: [isTarget ? 18 : 14, isTarget ? 44 : 34],
                  popupAnchor: [0, -(isTarget ? 44 : 34)],
                });

                return (
                  <Marker
                    key={
                      isTarget
                        ? `target-${idx}`
                        : `worker-${String(f.worker_id ?? idx)}-${idx}`
                    }
                    position={[f.lat, f.lng]}
                    icon={icon}
                  >
                    <Popup>
                      <strong>{f.label}</strong>
                      {!isTarget && f.worker_id != null ? (
                        <button
                          type="button"
                          style={{
                            marginTop: 8,
                            display: "block",
                            width: "100%",
                            padding: "6px 10px",
                            borderRadius: 8,
                            border: "none",
                            background: "linear-gradient(135deg, #6A38C2, #8B5CF6)",
                            color: "white",
                            fontSize: 12,
                            cursor: "pointer",
                          }}
                          onClick={() => navigate(`/description/${f.worker_id}`)}
                        >
                          View profile
                        </button>
                      ) : null}
                    </Popup>
                  </Marker>
                );
              })}
              </MapContainer>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
