import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { USER_API_END_POINT } from "../../utils/constant";
import { toast } from "sonner";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../../redux/authSlice";
import { Loader2, UserPlus, Mail, Phone, Lock, MapPin, Hash } from "lucide-react";
import Footer from "../shared/Footer";

const Singup = () => {
  const [input, setInput] = useState({
    fullname: "", email: "", phoneNumber: "", password: "",
    role: "", city: "", pincode: "", file: "",
  });
  const navigate = useNavigate();
  const { loading, user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  const changeEventHandler = (e) =>
    setInput({ ...input, [e.target.name]: e.target.value });
  const changeFileHandler = (e) =>
    setInput({ ...input, file: e.target.files?.[0] });

  const submitHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("fullname", input.fullname);
    if (input.email) formData.append("email", input.email);
    formData.append("phoneNumber", input.phoneNumber);
    formData.append("password", input.password);
    if (input.role) formData.append("role", input.role);
    if (input.file) formData.append("file", input.file);
    formData.append("city", input.city);
    formData.append("pincode", input.pincode);
    try {
      dispatch(setLoading(true));
      const res = await axios.post(`${USER_API_END_POINT}/register`, formData, { withCredentials: true });
      if (res.data.success) { navigate("/login"); toast.success(res.data.message); }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred during signup");
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    dispatch(setLoading(false));
    if (user) navigate("/");
  }, []);

  const fields = [
    { label: "Full Name",     name: "fullname",    type: "text",     icon: UserPlus, placeholder: "Enter your full name" },
    { label: "Email",         name: "email",       type: "email",    icon: Mail,     placeholder: "Enter your email" },
    { label: "Phone Number",  name: "phoneNumber", type: "text",     icon: Phone,    placeholder: "Enter your phone number" },
    { label: "City",          name: "city",        type: "text",     icon: MapPin,   placeholder: "Enter your city" },
    { label: "Pincode",       name: "pincode",     type: "text",     icon: Hash,     placeholder: "Enter your pincode" },
    { label: "Password",      name: "password",    type: "password", icon: Lock,     placeholder: "Create a password" },
  ];

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
              Join <span style={{ color: "var(--rs-saffron)" }}>RozgarSetu</span>
            </h1>
            <p style={{ color: "var(--rs-text-muted)", fontSize: "0.85rem" }}>
              India's inclusive gig marketplace
            </p>
          </div>

          <form onSubmit={submitHandler}>
            {/* Role */}
            <div style={{ marginBottom: "1.2rem" }}>
              <label className="rs-label">I am a</label>
              <div className="rs-radio-group">
                {["Client", "Worker"].map((r) => (
                  <label key={r} className={`rs-radio-option ${input.role === r ? "selected" : ""}`}>
                    <input type="radio" name="role" value={r} checked={input.role === r} onChange={changeEventHandler} style={{ display: "none" }} />
                    {r}
                  </label>
                ))}
              </div>
            </div>

            {/* Fields grid */}
            <div className="rs-grid-2-sm1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem", marginBottom: "1rem" }}>
              {fields.map(({ label, name, type, icon: Icon, placeholder }) => (
                <div key={name} style={{ gridColumn: name === "fullname" || name === "password" ? "1 / -1" : "auto" }}>
                  <label className="rs-label">{label}</label>
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
                      placeholder={placeholder}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Profile photo */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label className="rs-label">Profile Photo (optional)</label>
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
              {loading ? <><Loader2 size={16} className="animate-spin" /> Please wait…</> : <><UserPlus size={16} /> Create Account</>}
            </button>

            <p style={{ textAlign: "center", fontSize: "0.83rem", color: "var(--rs-text-muted)" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "var(--rs-saffron)", fontWeight: 600, textDecoration: "none" }}>
                Login
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
