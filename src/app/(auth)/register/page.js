"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";

import { getFirebaseAuth } from "@/lib/firebase/client";
import { formatFirebaseAuthError } from "@/lib/firebase/authErrors";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Jalandhar");
  const [state, setState] = useState("Punjab");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  async function handleRegister(event) {
    event.preventDefault();
    setError("");
    setResendMessage("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setError("Please enter your full name.");
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify both fields.");
      return;
    }

    setLoading(true);

    try {
      const firebaseAuth = getFirebaseAuth();
      if (!firebaseAuth) {
        throw new Error("Firebase Authentication is not available. Please check configuration.");
      }

      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        firebaseAuth,
        trimmedEmail,
        password
      );

      // 2. Set Firebase displayName
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: trimmedName }).catch(() => {});
      }

      // 3. Send email verification link
      await sendEmailVerification(userCredential.user);

      // 4. Register in database
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          password,
          city,
          state,
          phone: phone.replace(/\D/g, "").slice(-10),
          firebaseUid: userCredential.user.uid,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to create account profile.");
      }

      setRegisteredEmail(trimmedEmail);
      setIsRegistered(true);
      setResendCooldown(60);
    } catch (err) {
      setError(formatFirebaseAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    if (resendCooldown > 0) return;
    setError("");
    setResendMessage("");
    setLoading(true);

    try {
      const firebaseAuth = getFirebaseAuth();
      const currentUser = firebaseAuth?.currentUser;

      if (!currentUser) {
        throw new Error("Please log in to resend the verification link.");
      }

      await sendEmailVerification(currentUser);
      setResendMessage("Verification email resent. Please check your inbox and spam folder.");
      setResendCooldown(60);
    } catch (err) {
      setError(formatFirebaseAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  async function checkVerificationStatus() {
    setLoading(true);
    setError("");
    try {
      const firebaseAuth = getFirebaseAuth();
      const currentUser = firebaseAuth?.currentUser;
      if (currentUser) {
        await currentUser.reload();
        if (currentUser.emailVerified) {
          router.push(`/login?email=${encodeURIComponent(currentUser.email || "")}&verified=true`);
          return;
        }
      }
      setResendMessage("Email is not verified yet. Please check your inbox and click the verification link.");
    } catch (err) {
      setError(formatFirebaseAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{
        background:
          "radial-gradient(circle at 86% 12%, rgba(234,244,240,0.9) 0%, rgba(234,244,240,0) 46%), radial-gradient(circle at 12% 16%, rgba(245,200,66,0.16) 0%, rgba(245,200,66,0) 46%), #FAFAF8",
      }}
    >
      <div className="w-full max-w-[460px]">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/"
            style={{
              fontFamily: "Fraunces, serif",
              fontSize: 24,
              fontWeight: 700,
              color: "#0D1B2A",
              letterSpacing: "-0.03em",
              textDecoration: "none",
            }}
          >
            Nyay<span style={{ color: "#F5C842" }}>Setu</span>
          </Link>

          <Link href="/" style={{ fontSize: 12, color: "#4A5568", textDecoration: "none" }}>
            Back to Home
          </Link>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: 22,
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 12px 46px rgba(13,27,42,0.1)",
            padding: "28px 24px",
          }}
        >
          {isRegistered ? (
            <div className="space-y-4 text-center">
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "rgba(245,200,66,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 8px auto",
                  fontSize: 26,
                }}
              >
                ✉️
              </div>

              <h1
                style={{
                  fontFamily: "Fraunces, serif",
                  fontSize: 28,
                  color: "#0D1B2A",
                  letterSpacing: "-0.02em",
                  fontWeight: 700,
                }}
              >
                Check your email
              </h1>

              <p style={{ fontSize: 14, color: "#4A5568", lineHeight: 1.6 }}>
                We&apos;ve sent a verification link to <strong>{registeredEmail}</strong>.
                Please verify your email address to activate your account before logging in.
              </p>

              {resendMessage ? (
                <p style={{ fontSize: 13, color: "#166534", fontWeight: 600 }}>
                  {resendMessage}
                </p>
              ) : null}

              {error ? (
                <p style={{ fontSize: 13, color: "#B91C1C", fontWeight: 500 }}>
                  {error}
                </p>
              ) : null}

              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={checkVerificationStatus}
                  disabled={loading}
                  className="btn-yellow"
                  style={{
                    width: "100%",
                    textAlign: "center",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Checking..." : "I've Verified My Email"}
                </button>

                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={loading || resendCooldown > 0}
                  className="btn-outline-sm"
                  style={{
                    width: "100%",
                    textAlign: "center",
                    opacity: resendCooldown > 0 ? 0.6 : 1,
                    cursor: resendCooldown > 0 || loading ? "not-allowed" : "pointer",
                  }}
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend Verification Email"}
                </button>

                <div className="pt-2">
                  <Link
                    href="/login"
                    style={{
                      fontSize: 13,
                      color: "#0D1B2A",
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    Go to Login &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              <h1
                style={{
                  fontFamily: "Fraunces, serif",
                  fontSize: 32,
                  color: "#0D1B2A",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                Create Account
              </h1>

              <p style={{ fontSize: 13, color: "#4A5568", marginBottom: 18 }}>
                Join NyaySetu and participate in civic accountability.
              </p>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    style={{ display: "block", marginBottom: 5, fontSize: 12, fontWeight: 600, color: "#4A5568" }}
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      border: "1px solid rgba(0,0,0,0.08)",
                      background: "#FAFAF8",
                      borderRadius: 10,
                      padding: "10px 12px",
                      fontSize: 14,
                      color: "#0D1B2A",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    style={{ display: "block", marginBottom: 5, fontSize: 12, fontWeight: 600, color: "#4A5568" }}
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      border: "1px solid rgba(0,0,0,0.08)",
                      background: "#FAFAF8",
                      borderRadius: 10,
                      padding: "10px 12px",
                      fontSize: 14,
                      color: "#0D1B2A",
                      outline: "none",
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="password"
                      style={{ display: "block", marginBottom: 5, fontSize: 12, fontWeight: 600, color: "#4A5568" }}
                    >
                      Password
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 6 chars"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        style={{
                          width: "100%",
                          border: "1px solid rgba(0,0,0,0.08)",
                          background: "#FAFAF8",
                          borderRadius: 10,
                          padding: "10px 36px 10px 12px",
                          fontSize: 14,
                          color: "#0D1B2A",
                          outline: "none",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        style={{
                          position: "absolute",
                          right: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          border: "none",
                          background: "transparent",
                          color: "#4A5568",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      style={{ display: "block", marginBottom: 5, fontSize: 12, fontWeight: 600, color: "#4A5568" }}
                    >
                      Confirm Password
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        style={{
                          width: "100%",
                          border: "1px solid rgba(0,0,0,0.08)",
                          background: "#FAFAF8",
                          borderRadius: 10,
                          padding: "10px 36px 10px 12px",
                          fontSize: 14,
                          color: "#0D1B2A",
                          outline: "none",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        style={{
                          position: "absolute",
                          right: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          border: "none",
                          background: "transparent",
                          color: "#4A5568",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="city"
                      style={{ display: "block", marginBottom: 5, fontSize: 12, fontWeight: 600, color: "#4A5568" }}
                    >
                      City
                    </label>
                    <select
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        border: "1px solid rgba(0,0,0,0.08)",
                        background: "#FAFAF8",
                        borderRadius: 10,
                        padding: "10px 12px",
                        fontSize: 14,
                        color: "#0D1B2A",
                        outline: "none",
                      }}
                    >
                      <option value="Jalandhar">Jalandhar</option>
                      <option value="Ludhiana">Ludhiana</option>
                      <option value="Amritsar">Amritsar</option>
                      <option value="Chandigarh">Chandigarh</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="state"
                      style={{ display: "block", marginBottom: 5, fontSize: 12, fontWeight: 600, color: "#4A5568" }}
                    >
                      State
                    </label>
                    <select
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        border: "1px solid rgba(0,0,0,0.08)",
                        background: "#FAFAF8",
                        borderRadius: 10,
                        padding: "10px 12px",
                        fontSize: 14,
                        color: "#0D1B2A",
                        outline: "none",
                      }}
                    >
                      <option value="Punjab">Punjab</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Himachal Pradesh">Himachal Pradesh</option>
                      <option value="Chandigarh">Chandigarh</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    style={{ display: "block", marginBottom: 5, fontSize: 12, fontWeight: 600, color: "#4A5568" }}
                  >
                    Contact Mobile <span style={{ fontWeight: 400, color: "#8A9BAA" }}>(optional)</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    style={{
                      width: "100%",
                      border: "1px solid rgba(0,0,0,0.08)",
                      background: "#FAFAF8",
                      borderRadius: 10,
                      padding: "10px 12px",
                      fontSize: 14,
                      color: "#0D1B2A",
                      outline: "none",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-yellow"
                  style={{
                    width: "100%",
                    textAlign: "center",
                    opacity: loading ? 0.75 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                    marginTop: 10,
                  }}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>

              {error ? (
                <p style={{ marginTop: 12, fontSize: 13, color: "#B91C1C", fontWeight: 500 }}>
                  {error}
                </p>
              ) : null}

              <p style={{ marginTop: 22, fontSize: 13, color: "#4A5568", textAlign: "center" }}>
                Already have an account?{" "}
                <Link href="/login" style={{ color: "#0D1B2A", fontWeight: 700, textDecoration: "none" }}>
                  Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
