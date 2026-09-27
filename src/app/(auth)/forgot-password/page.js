"use client";

import Link from "next/link";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";

import { getFirebaseAuth } from "@/lib/firebase/client";
import { formatFirebaseAuthError } from "@/lib/firebase/authErrors";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sentSuccess, setSentSuccess] = useState(false);

  async function handleResetPassword(event) {
    event.preventDefault();
    setError("");

    const trimmedEmail = email.trim().toLowerCase();
    if (!isValidEmail(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const firebaseAuth = getFirebaseAuth();
      if (!firebaseAuth) {
        throw new Error("Authentication service is unavailable. Please check configuration.");
      }

      await sendPasswordResetEmail(firebaseAuth, trimmedEmail);
      setSentSuccess(true);
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

          <Link href="/login" style={{ fontSize: 12, color: "#4A5568", textDecoration: "none" }}>
            Back to Login
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
          {sentSuccess ? (
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
                📬
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
                Password reset email sent
              </h1>

              <p style={{ fontSize: 14, color: "#4A5568", lineHeight: 1.6 }}>
                We have sent instructions to reset your password to <strong>{email}</strong>.
                Please check your inbox (and spam folder) and follow the link to set a new password.
              </p>

              <div className="pt-3">
                <Link
                  href="/login"
                  className="btn-yellow"
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "center",
                    textDecoration: "none",
                  }}
                >
                  Return to Login
                </Link>
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
                Reset Password
              </h1>

              <p style={{ fontSize: 14, color: "#4A5568", marginBottom: 20 }}>
                Enter the email address associated with your account and we&apos;ll send you a password reset link.
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label
                    htmlFor="reset-email"
                    style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600, color: "#4A5568" }}
                  >
                    Email Address
                  </label>
                  <input
                    id="reset-email"
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
                  {loading ? "Sending reset link..." : "Send Password Reset Link"}
                </button>

                {error ? (
                  <p style={{ marginTop: 10, fontSize: 13, color: "#B91C1C", fontWeight: 500 }}>
                    {error}
                  </p>
                ) : null}
              </form>

              <p style={{ marginTop: 24, fontSize: 13, color: "#4A5568", textAlign: "center" }}>
                Remember your password?{" "}
                <Link href="/login" style={{ color: "#0D1B2A", fontWeight: 700, textDecoration: "none" }}>
                  Log in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
