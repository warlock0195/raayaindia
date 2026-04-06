import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import SectionHeading from "../components/SectionHeading";
import { useAuth } from "../context/AuthContext";

const LoginRegisterPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone_number: "",
    email: "",
    password: "",
    role: "customer",
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      if (mode === "register") {
        await register(form);
      }
      await login({ email: form.email, password: form.password });
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to authenticate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-container py-12 md:py-16">
      <SectionHeading eyebrow="Account" title={mode === "login" ? "Welcome Back" : "Create Your Account"} center />

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={onSubmit}
        className="mx-auto mt-8 max-w-xl space-y-4 luxury-card p-7"
      >
        {mode === "register" ? (
          <>
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full border border-black/20 bg-transparent px-3 py-3 text-sm"
              placeholder="Full Name"
              required
            />
            <input
              value={form.phone_number}
              onChange={(e) => setForm((prev) => ({ ...prev, phone_number: e.target.value }))}
              className="w-full border border-black/20 bg-transparent px-3 py-3 text-sm"
              placeholder="Phone Number"
              required
            />
          </>
        ) : null}

        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          className="w-full border border-black/20 bg-transparent px-3 py-3 text-sm"
          placeholder="Email"
          required
        />

        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          className="w-full border border-black/20 bg-transparent px-3 py-3 text-sm"
          placeholder="Password"
          required
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button className="raaya-button w-full" disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Register & Continue"}
        </button>

        <button
          type="button"
          className="w-full text-center text-sm text-black/70 hover:text-raayaGold"
          onClick={() => setMode((prev) => (prev === "login" ? "register" : "login"))}
        >
          {mode === "login" ? "New to Raaya? Create account" : "Already have an account? Login"}
        </button>
      </motion.form>
    </div>
  );
};

export default LoginRegisterPage;
