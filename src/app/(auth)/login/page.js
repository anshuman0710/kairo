"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";

import { getFirebaseAuth } from "@/lib/firebase/client";
import { formatFirebaseAuthError } from "@/lib/firebase/authErrors";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const [isUnverified, setIsUnverified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const verifiedParam = searchParams.get("verified");
    if (emailParam) {
      setEmail(emailParam);
    }
    if (verifiedParam === "true") {
      setInfoMessage("Email verified successfully! You can now log in.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  async function completeServerLogin(loginEmail, loginPassword, firebaseUid, emailVerified) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: loginEmail,
        password: loginPassword,
        firebaseUid: firebaseUid || "",
        emailVerified: Boolean(emailVerified),
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || "Login failed. Please try again.");
    }

    const role = data?.user?.role;
    if (role === "authority") {
      router.push("/dashboard/authority");
    } else {
      router.push("/dashboard/citizen");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setInfoMessage("");
    setResendSuccess("");
    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();

    try {
      const firebaseAuth = getFirebaseAuth();

      if (!firebaseAuth) {
        // Fallback directly to server login if Firebase client is not configured
        await completeServerLogin(trimmedEmail, password, "", false);
        return;
      }

      let userCredential = null;
      try {
        userCredential = await signInWithEmailAndPassword(
          firebaseAuth,
          trimmedEmail,
          password
        );
      } catch (fbError) {
        const code = String(fbError.code || "").toLowerCase();
        // If user is not found in Firebase, check if it is a seeded authority account in MongoDB
        if (code.includes("user-not-found") || code.includes("invalid-credential")) {
          try {
            await completeServerLogin(trimmedEmail, password, "", false);
            return;
          } catch (_serverError) {
            throw fbError;
          }
        }
        throw fbError;
      }

      const fbUser = userCredential.user;

      // Check email verification status
      if (!fbUser.emailVerified) {
        setIsUnverified(true);
        setUnverifiedEmail(trimmedEmail);
        setLoading(false);
        return;
      }

      // User is verified: synchronize session with server
      await completeServerLogin(trimmedEmail, password, fbUser.uid, true);
    } catch (submitError) {
      setError(formatFirebaseAuthError(submitError));
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    if (resendCooldown > 0) return;
    setError("");
    setResendSuccess("");
    setLoading(true);

    try {
      const firebaseAuth = getFirebaseAuth();
      const currentUser = firebaseAuth?.currentUser;

      if (!currentUser) {
        throw new Error("Session expired. Please log in again to request a new link.");
      }

      await sendEmailVerification(currentUser);
      setResendSuccess("Verification email resent. Please check your inbox and spam folder.");
      setResendCooldown(60);
    } catch (err) {
      setError(formatFirebaseAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckVerification() {
    setError("");
    setResendSuccess("");
    setLoading(true);

    try {
      const firebaseAuth = getFirebaseAuth();
      const currentUser = firebaseAuth?.currentUser;

      if (!currentUser) {
        setIsUnverified(false);
        throw new Error("Session expired. Please log in again.");
      }

      await currentUser.reload();

      if (currentUser.emailVerified) {
        await completeServerLogin(unverifiedEmail, password, currentUser.uid, true);
        return;
      }

      setResendSuccess("Email is still not verified. Please click the link in your email.");
    } catch (err) {
      setError(formatFirebaseAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLoading(true);
    try {
      const firebaseAuth = getFirebaseAuth();
      if (firebaseAuth) {
        await signOut(firebaseAuth).catch(() => {});
      }
      setIsUnverified(false);
      setUnverifiedEmail("");
      setPassword("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{
        background:
          "radial-gradient(circle at 10% 15%, rgba(245,200,66,0.16) 0%, rgba(245,200,66,0) 44%), radial-gradient(circle at 90% 8%, rgba(13,27,42,0.08) 0%, rgba(13,27,42,0) 38%), #FAFAF8",
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
          {isUnverified ? (
            <div className="space-y-4 text-center">
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "rgba(220,38,38,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 8px auto",
                  fontSize: 26,
                }}
              >
                ⚠️
              </div>

              <h1
                style={{
                  fontFamily: "Fraunces, serif",
                  fontSize: 26,
                  color: "#0D1B2A",
                  letterSpacing: "-0.02em",
                  fontWeight: 700,
                }}
              >
                Please verify your email
              </h1>

              <p style={{ fontSize: 14, color: "#4A5568", lineHeight: 1.6 }}>
                Your email address <strong>{unverifiedEmail}</strong> has not been verified yet.
                Please verify your email before continuing to the platform.
              </p>

              {resendSuccess ? (
                <p style={{ fontSize: 13, color: "#166534", fontWeight: 600 }}>
                  {resendSuccess}
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
                  onClick={handleCheckVerification}
                  disabled={loading}
                  className="btn-yellow"
                  style={{
                    width: "100%",
                    textAlign: "center",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Checking status..." : "I've Verified My Email"}
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

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loading}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#4A5568",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "underline",
                    display: "block",
                    margin: "12px auto 0 auto",
                  }}
                >
                  Logout & Use Different Account
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1
                style={{
                  fontFamily: "Fraunces, serif",
                  fontSize: 34,
                  color: "#0D1B2A",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                Log in
              </h1>

              <p style={{ fontSize: 14, color: "#4A5568", marginBottom: 20 }}>
                Continue managing grievances and petition momentum.
              </p>

              {infoMessage ? (
                <div
                  style={{
                    background: "rgba(22,101,52,0.08)",
                    border: "1px solid rgba(22,101,52,0.2)",
                    borderRadius: 10,
                    padding: "10px 12px",
                    marginBottom: 16,
                    fontSize: 13,
                    color: "#166534",
                    fontWeight: 500,
                  }}
                >
                  {infoMessage}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600, color: "#4A5568" }}
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    style={{
                      width: "100%",
                      border: "1px solid rgba(0,0,0,0.08)",
                      background: "#FAFAF8",
                      borderRadius: 10,
                      padding: "11px 13px",
                      fontSize: 14,
                      color: "#0D1B2A",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                    <label
                      htmlFor="password"
                      style={{ fontSize: 12, fontWeight: 600, color: "#4A5568" }}
                    >
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      style={{
                        fontSize: 12,
                        color: "#0D1B2A",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <div style={{ position: "relative" }}>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      style={{
                        width: "100%",
                        border: "1px solid rgba(0,0,0,0.08)",
                        background: "#FAFAF8",
                        borderRadius: 10,
                        padding: "11px 40px 11px 13px",
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
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        border: "none",
                        background: "transparent",
                        color: "#4A5568",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-yellow"
                  style={{
                    width: "100%",
                    textAlign: "center",
                    opacity: loading ? 0.8 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                    marginTop: 8,
                  }}
                >
                  {loading ? "Logging in..." : "Log in"}
                </button>

                {error ? (
                  <p style={{ marginTop: 10, fontSize: 13, color: "#B91C1C", fontWeight: 500 }}>
                    {error}
                  </p>
                ) : null}
              </form>

              <p style={{ marginTop: 24, fontSize: 13, color: "#4A5568", textAlign: "center" }}>
                Don&apos;t have an account?{" "}
                <Link href="/register" style={{ color: "#0D1B2A", fontWeight: 700, textDecoration: "none" }}>
                  Create Account
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
