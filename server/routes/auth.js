const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");

// Email Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send verification email  
async function sendVerificationEmail(email, code) {
  await transporter.sendMail({
    from: `"PHENOPREDICT" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your PHENOPREDICT account",
    html: `
      <h2>Your verification code</h2>
      <h1>${code}</h1>
      <p>Expires in 10 minutes.</p>
    `,
  });
}

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: "All fields are required" });

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new User({
      name,
      email,
      password: hashed,
      verificationCode: otp,
      verificationExpires: Date.now() + 10 * 60 * 1000,
    });

    await user.save();
    await sendVerificationEmail(email, otp);

    res.status(201).json({ message: "OTP sent", email });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// VERIFY OTP
router.post("/verify", async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    if (user.verified)
      return res.status(400).json({ error: "Already verified" });

    if (user.verificationCode !== code)
      return res.status(400).json({ error: "Invalid OTP" });

    if (user.verificationExpires < Date.now())
      return res.status(400).json({ error: "OTP expired" });

    user.verified = true;
    user.verificationCode = undefined;
    user.verificationExpires = undefined;
    await user.save();

    res.json({ message: "Verified successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    if (!user.verified)
      return res.status(400).json({ error: "Verify email first" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.SECRET_KEY || "dev_secret",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login success",
      token,
      user: { name: user.name, email: user.email },
    });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
