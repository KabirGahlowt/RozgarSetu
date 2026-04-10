import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { USER_API_END_POINT, WORKER_API_END_POINT } from "../../utils/constant";
import { toast } from "sonner";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../../redux/authSlice";
import { Loader2, UserPlus, Mail, Phone, Lock, MapPin, Hash, Home, Briefcase, Clock, Award } from "lucide-react";
import Footer from "../shared/Footer";
import { useTranslation } from "react-i18next";

const ROLE_VALUES = ["Client", "Worker"];

const Singup = () => {
  const { t } = useTranslation();
  const [input, setInput] = useState({
    fullname: "", email: "", phoneNumber: "", password: "",
    role: "", address: "", city: "", pincode: "", file: "",
    skills: "", avaliability: "", experienceYears: "",
  });
  const navigate = useNavigate();
  const { loading, user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  const fields = [
    { name: "fullname", type: "text", icon: UserPlus, labelKey: "auth.fullName", placeholderKey: "auth.enterFullName", required: true },
    { name: "email", type: "email", icon: Mail, labelKey: "auth.email", placeholderKey: "auth.enterEmail", required: "client" },
    { name: "phoneNumber", type: "text", icon: Phone, labelKey: "auth.phoneNumber", placeholderKey: "auth.enterPhone", required: true },
    { name: "address", type: "text", icon: Home, labelKey: "profile.address", placeholderKey: "auth.enterAddress", required: true },
    { name: "city", type: "text", icon: MapPin, labelKey: "auth.city", placeholderKey: "auth.enterCity", required: true },
    { name: "pincode", type: "text", icon: Hash, labelKey: "profile.pincode", placeholderKey: "auth.enterPincode", required: true },
    { name: "password", type: "password", icon: Lock, labelKey: "auth.password", placeholderKey: "auth.createPassword", required: true },
  ];

  const workerFields = [
    { name: "skills", type: "text", icon: Briefcase, labelKey: "workerProfile.skills", placeholderKey: "auth.enterSkills", required: true },
    { name: "avaliability", type: "text", icon: Clock, labelKey: "workerProfile.availability", placeholderKey: "workerProfile.availabilityPlaceholder", required: true },
    { name: "experienceYears", type: "number", icon: Award, labelKey: "workerProfile.yearsOfExperience", placeholderKey: "auth.enterYearsExperience", required: true },
  ];

  const changeEventHandler = (e) =>
    setInput({ ...input, [e.target.name]: e.target.value });
  const changeFileHandler = (e) =>
    setInput({ ...input, file: e.target.files?.[0] });

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!input.role) {
      toast.error(t("auth.selectRole"));
      return;
    }
    for (const f of fields) {
      const req =
        f.required === true || (f.required === "client" && input.role === "Client");
      if (req && !String(input[f.name] ?? "").trim()) {
        toast.error(t("auth.fillRequired"));
        return;
      }
    }
    if (input.role === "Worker") {
      for (const f of workerFields) {
        if (!String(input[f.name] ?? "").trim()) {
          toast.error(t("auth.fillRequired"));
          return;
        }
      }
    }

    try {
      dispatch(setLoading(true));

      if (input.role === "Worker") {
        const formData = new FormData();
        formData.append("fullname", input.fullname);
        formData.append("phoneNumber", input.phoneNumber);
        formData.append("password", input.password);
        formData.append("address", input.address || "");
        formData.append("city", input.city);
        formData.append("pincode", input.pincode);
        formData.append("skills", input.skills);
        formData.append("avaliability", input.avaliability);
        formData.append("experienceYears", String(input.experienceYears));
        if (input.file) formData.append("file", input.file);
        const res = await axios.post(`${WORKER_API_END_POINT}/register`, formData, { withCredentials: true });
        if (res.data.success) {
          navigate("/login");
          toast.success(res.data.message);
        }
        return;
      }

      const formData = new FormData();
      formData.append("fullname", input.fullname);
      if (input.email) formData.append("email", input.email);
      formData.append("phoneNumber", input.phoneNumber);
      formData.append("password", input.password);
      if (input.role) formData.append("role", input.role);
      if (input.file) formData.append("file", input.file);
      formData.append("address", input.address || "");
      formData.append("city", input.city);
      formData.append("pincode", input.pincode);
      const res = await axios.post(`${USER_API_END_POINT}/register`, formData, { withCredentials: true });
      if (res.data.success) {
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t("auth.signupError"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    dispatch(setLoading(false));
    if (user) navigate("/");
  }, []);

  return (
    <div className="rs-page">
      <div className="rs-tricolor" />
      <Navbar />
      <div style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
      }}>
        <div className="rs-glass-strong rs-anim" style={{
          width: "min(500px, 96vw)",
          padding: "2.5rem",
          borderRadius: "1.5rem",
        }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h1 style={{ fontFamily: "var(--rs-font)", fontSize: "1.75rem", fontWeight: 700, color: "#fff", margin: "0 0 0.4rem" }}>
              {t("auth.join")} <span style={{ color: "var(--rs-saffron)" }}>RozgarSetu</span>
            </h1>
            <p style={{ color: "var(--rs-text-muted)", fontSize: "0.85rem", margin: 0 }}>
              {input.role === "Worker"
                ? t("auth.roleWorkerDesc")
                : input.role === "Client"
                  ? t("auth.roleClientDesc")
                  : t("auth.marketplace")}
            </p>
          </div>

          <form onSubmit={submitHandler}>
            {/* Role */}
            <div style={{ marginBottom: "1.2rem" }}>
              <label className="rs-label">
                {t("auth.iAm")}
                <span style={{ color: "#f87171", marginLeft: 3 }} aria-hidden>
                  {" *"}
                </span>
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                {ROLE_VALUES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setInput((prev) => ({ ...prev, role: r }))}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.85rem 0.75rem",
                      borderRadius: "0.85rem",
                      cursor: "pointer",
                      fontFamily: "var(--rs-font)",
                      border:
                        input.role === r ? "1.5px solid #FF9933" : "1px solid rgba(255,255,255,0.12)",
                      background:
                        input.role === r ? "rgba(255,153,51,0.14)" : "rgba(255,255,255,0.04)",
                      color: input.role === r ? "#FF9933" : "rgba(255,255,255,0.85)",
                      transition: "all 0.18s ease",
                    }}
                  >
                    <span style={{ fontSize: "0.88rem", fontWeight: 700 }}>
                      {r === "Client" ? t("nav.roleClient") : t("nav.roleWorker")}
                    </span>
                    <span style={{ fontSize: "0.68rem", opacity: 0.75, textAlign: "center", lineHeight: 1.35 }}>
                      {r === "Client" ? t("auth.roleClientDesc") : t("auth.roleWorkerDesc")}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fields grid */}
            <div className="rs-grid-2-sm1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem", marginBottom: "1rem" }}>
              {fields
                .filter((f) => input.role !== "Worker" || f.name !== "email")
                .map(({ name, type, icon: Icon, labelKey, placeholderKey, required }) => {
                const showStar =
                  required === true || (required === "client" && input.role === "Client");
                return (
                <div key={name} style={{ gridColumn: name === "fullname" || name === "password" || name === "address" ? "1 / -1" : "auto" }}>
                  <label className="rs-label">
                    {t(labelKey)}
                    {showStar && (
                      <span style={{ color: "#f87171", marginLeft: 3 }} aria-hidden>
                        {" *"}
                      </span>
                    )}
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "0.8rem", top: "50%", transform: "translateY(-50%)", color: "var(--rs-text-muted)" }}>
                      <Icon size={14} />
                    </span>
                    <input
                      className="rs-input"
                      style={{ paddingLeft: "2.2rem" }}
                      type={type}
                      name={name}
                      value={input[name]}
                      onChange={changeEventHandler}
                      placeholder={t(placeholderKey)}
                    />
                  </div>
                </div>
                );
              })}
            </div>

            {input.role === "Worker" && (
              <div
                className="rs-grid-2-sm1"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.85rem",
                  marginBottom: "1rem",
                }}
              >
                {workerFields.map(({ name, type, icon: Icon, labelKey, placeholderKey, required }) => (
                  <div
                    key={name}
                    style={{
                      gridColumn: name === "skills" ? "1 / -1" : "auto",
                    }}
                  >
                    <label className="rs-label">
                      {t(labelKey)}
                      {required && (
                        <span style={{ color: "#f87171", marginLeft: 3 }} aria-hidden>
                          {" *"}
                        </span>
                      )}
                    </label>
                    <div style={{ position: "relative" }}>
                      <span
                        style={{
                          position: "absolute",
                          left: "0.8rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "var(--rs-text-muted)",
                        }}
                      >
                        <Icon size={14} />
                      </span>
                      <input
                        className="rs-input"
                        style={{ paddingLeft: "2.2rem" }}
                        type={type}
                        name={name}
                        min={type === "number" ? "0" : undefined}
                        value={input[name]}
                        onChange={changeEventHandler}
                        placeholder={t(placeholderKey)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Profile photo */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label className="rs-label">{t("auth.profilePhotoOptional")}</label>
              <input
                type="file"
                accept="image/*"
                onChange={changeFileHandler}
                style={{
                  width: "100%",
                  padding: "0.55rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "0.6rem",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "0.82rem",
                  fontFamily: "var(--rs-font)",
                  cursor: "pointer",
                }}
              />
            </div>

            <button
              type="submit"
              className="rs-btn-primary"
              style={{ width: "100%", padding: "0.75rem", fontSize: "0.95rem", marginBottom: "1.25rem" }}
              disabled={loading}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> {t("auth.pleaseWait")}</> : <><UserPlus size={16} /> {t("auth.createAccount")}</>}
            </button>

            <p style={{ textAlign: "center", fontSize: "0.83rem", color: "var(--rs-text-muted)" }}>
              {t("auth.haveAccount")}{" "}
              <Link to="/login" style={{ color: "var(--rs-saffron)", fontWeight: 600, textDecoration: "none" }}>
                {t("nav.login")}
              </Link>
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Singup;
