// src/Components/Signup.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { register } from "../api";
import { toast } from "react-toastify";
import bg from "../assets/bg.jpg";
import { FaLeaf, FaUser, FaFingerprint, FaLock } from "react-icons/fa6";

import { useLanguage } from "../LanguageContext";

// =======================
//  TEXT TRANSLATIONS
// =======================
const uiText = {
  newResearcher: {
    en: "New Researcher",
    te: "కొత్త పరిశోధకుడు",
    hi: "नया शोधकर्ता"
  },
  requestClearance: {
    en: "Request Clearance",
    te: "క్లియరెన్స్ అభ్యర్థించండి",
    hi: "क्लियरेंस अनुरोध"
  },
  fullName: {
    en: "Full Name",
    te: "పూర్తి పేరు",
    hi: "पूरा नाम"
  },
  emailID: {
    en: "Email ID",
    te: "ఈమెయిల్ ID",
    hi: "ईमेल ID"
  },
  securePassword: {
    en: "Secure Password",
    te: "సురక్షిత పాస్‌వర్డ్",
    hi: "सुरक्षित पासवर्ड"
  },
  placeholderName: {
    en: "Dr. Jane Doe",
    te: "డా. జేన్ డో",
    hi: "डॉ. जेन डो"
  },
  placeholderEmail: {
    en: "researcher@agri.io",
    te: "researcher@agri.io",
    hi: "researcher@agri.io"
  },
  placeholderPassword: {
    en: "••••••••",
    te: "••••••••",
    hi: "••••••••"
  },
  createProfile: {
    en: "CREATE PROFILE",
    te: "ప్రొఫైల్ సృష్టించండి",
    hi: "प्रोफ़ाइल बनाएँ"
  },
  encrypting: {
    en: "Encrypting...",
    te: "ఎన్క్రిప్ట్ చేస్తున్నారు...",
    hi: "एन्क्रिप्ट किया जा रहा है..."
  },
  alreadyHaveClearance: {
    en: "Already have clearance?",
    te: "ఇప్పటికే క్లియరెన్స్ ఉందా?",
    hi: "क्या आपके पास पहले से क्लियरेंस है?"
  },
  accessSystemLogin: {
    en: "Access System Login",
    te: "సిస్టమ్ లాగిన్‌కి వెళ్లండి",
    hi: "सिस्टम लॉगिन पर जाएँ"
  },
  requestReceived: {
    en: "Access Request Received.",
    te: "యాక్సెస్ అభ్యర్థన అందింది.",
    hi: "प्रवेश अनुरोध प्राप्त हुआ।"
  }
};

const autofillStyles = `
  input:-webkit-autofill,
  input:-webkit-autofill:hover, 
  input:-webkit-autofill:focus, 
  input:-webkit-autofill:active{
      -webkit-background-clip: text;
      -webkit-text-fill-color: #ffffff;
      transition: background-color 5000s ease-in-out 0s;
      box-shadow: inset 0 0 20px 20px rgba(0,0,0,0);
  }
`;

const Signup = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key) => uiText[key][language];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [particles, setParticles] = useState([]);

  // Particle animation
  useEffect(() => {
    const newParticles = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 10 + 5,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await register(name, email, password);

    if (res.error) {
      toast.error(res.error);
      setIsLoading(false);
      return;
    }

    toast.success(t("requestReceived"));
    localStorage.setItem("pendingEmail", email);
    setTimeout(() => navigate("/verify"), 1000);
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden font-sans bg-black">
      <style>{autofillStyles}</style>

      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="absolute inset-0 bg-black/70 z-0" />
      </div>

      {/* Particles */}
      <div className="fixed inset-0 z-10 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              bottom: "-10px",
            }}
            animate={{
              y: [0, -1000],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Main Card */}
      <div className="relative z-20 w-full max-w-md p-6 pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="relative w-full"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-green-500/20 blur-[80px] rounded-full -z-10" />

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden ring-1 ring-white/5">

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">
                {t("newResearcher")}
              </h2>
              <div className="flex items-center justify-center gap-2 mt-2 opacity-70">
                <span className="h-[1px] w-6 bg-green-500"></span>
                <p className="text-emerald-300 text-xs font-mono uppercase tracking-[0.2em]">
                  {t("requestClearance")}
                </p>
                <span className="h-[1px] w-6 bg-green-500"></span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-emerald-300/80 uppercase ml-2 tracking-wider">
                  {t("fullName")}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <FaUser className="text-gray-400 group-focus-within:text-green-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("placeholderName")}
                    className="block w-full pl-11 pr-4 py-4 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400/50 transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-emerald-300/80 uppercase ml-2 tracking-wider">
                  {t("emailID")}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <FaFingerprint className="text-gray-400 group-focus-within:text-green-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("placeholderEmail")}
                    className="block w-full pl-11 pr-4 py-4 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400/50 transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-emerald-300/80 uppercase ml-2 tracking-wider">
                  {t("securePassword")}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <FaLock className="text-gray-400 group-focus-within:text-green-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("placeholderPassword")}
                    className="block w-full pl-11 pr-4 py-4 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400/50 transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-4 mt-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 disabled:opacity-70 shadow-lg shadow-green-900/40 border border-white/10 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? t("encrypting") : t("createProfile")}
                </span>
              </motion.button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-white/40 text-xs mb-2">
                {t("alreadyHaveClearance")}
              </p>
              <Link
                to="/login"
                className="text-green-400 font-semibold hover:text-green-300 border-b border-transparent hover:border-green-300 pb-0.5 transition-all"
              >
                {t("accessSystemLogin")}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
